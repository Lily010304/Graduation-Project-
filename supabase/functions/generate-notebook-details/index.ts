// Supabase Edge Function: generate-notebook-details
// Atomic claim + TTL logic before invoking n8n workflow
// Deno runtime (Supabase Functions)

// @ts-ignore: Remote Deno module resolution handled by Supabase Edge runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-ignore: Remote Deno module resolution handled by Supabase Edge runtime
import { serve } from 'https://deno.land/std@0.216.0/http/server.ts';

// Declare Deno for TypeScript linting in non-Deno editors
// (Supabase deploy environment provides the real Deno global)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

// Expected environment variables configured in Supabase dashboard
const WORKER_ID = Deno.env.get('WORKER_ID') ?? 'edge-worker-1';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const N8N_WEBHOOK_URL = Deno.env.get('N8N_NOTEBOOK_DETAILS_WEBHOOK_URL');
const CLAIM_TIMEOUT_SECONDS = Number(Deno.env.get('METADATA_CLAIM_TIMEOUT') ?? '900'); // default 15 min

function missingEnv(): string[] {
  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!N8N_WEBHOOK_URL) missing.push('N8N_NOTEBOOK_DETAILS_WEBHOOK_URL');
  return missing;
}

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

interface ClaimResult { id: string; claimed: boolean; }

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key, X-Notebook-Id',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    }
  });
}

async function claimNotebook(notebookId: string): Promise<ClaimResult> {
  if (!supabase) throw new Error('Supabase client unavailable');
  const { data, error } = await supabase.rpc('claim_notebook_metadata', {
    p_notebook_id: notebookId,
    p_worker_id: WORKER_ID,
    p_timeout_seconds: CLAIM_TIMEOUT_SECONDS
  });
  if (error) throw new Error(`claim_notebook_metadata RPC failed: ${error.message}`);
  if (!data || !Array.isArray(data) || data.length === 0) return { id: notebookId, claimed: false };
  return data[0] as ClaimResult;
}

async function markCompleted(notebookId: string) {
  if (!supabase) return;
  const { error } = await supabase.rpc('complete_notebook_metadata', { p_notebook_id: notebookId });
  if (error) console.error('complete_notebook_metadata error:', error.message);
}

async function markFailed(notebookId: string) {
  if (!supabase) return;
  const { error } = await supabase.rpc('fail_notebook_metadata', { p_notebook_id: notebookId });
  if (error) console.error('fail_notebook_metadata error:', error.message);
}

async function triggerN8n(notebookId: string, idempotencyKey: string) {
  if (!N8N_WEBHOOK_URL) throw new Error('Missing N8N webhook URL');
  const resp = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
      'X-Notebook-Id': notebookId
    },
    body: JSON.stringify({ notebook_id: notebookId })
  });
  const text = await resp.text();
  return { status: resp.status, body: text };
}

function generateIdempotencyKey(notebookId: string): string {
  // Hour bucket reduces duplicate invocations within same hour per notebook
  return `${notebookId}:metadata:${new Date().toISOString().slice(0, 13)}`;
}

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return jsonResponse(204, {});
  }

  const missing = missingEnv();
  if (missing.length) {
    console.error('Missing env vars', missing);
    return jsonResponse(500, { error: 'Missing required environment variables', missing });
  }

  const url = new URL(req.url);
  const notebookId = url.searchParams.get('notebook_id') || (await (async () => {
    try { const b = await req.clone().json(); return b?.notebook_id; } catch { return null; } })());

  if (!notebookId) {
    return jsonResponse(400, { error: 'Missing notebook_id' });
  }

  const start = Date.now();
  console.log(JSON.stringify({ event: 'attempt_claim', notebookId, worker: WORKER_ID }));

  try {
    const claim = await claimNotebook(notebookId);
    if (!claim.claimed) {
      console.log(JSON.stringify({ event: 'skip_already_claimed', notebookId }));
      return jsonResponse(200, { status: 'skipped', notebook_id: notebookId });
    }

    console.log(JSON.stringify({ event: 'claimed', notebookId, worker: WORKER_ID }));
    const idempotencyKey = generateIdempotencyKey(notebookId);
    const n8nResult = await triggerN8n(notebookId, idempotencyKey);

    if (n8nResult.status >= 200 && n8nResult.status < 300) {
      await markCompleted(notebookId);
      console.log(JSON.stringify({ event: 'completed', notebookId, durationMs: Date.now() - start }));
      return jsonResponse(200, { status: 'completed', notebook_id: notebookId });
    } else {
      await markFailed(notebookId);
      console.error(JSON.stringify({ event: 'n8n_error', notebookId, status: n8nResult.status, body: n8nResult.body }));
      return jsonResponse(502, { status: 'failed', notebook_id: notebookId, error: 'n8n invocation failed' });
    }
  } catch (e) {
    await markFailed(notebookId);
    console.error(JSON.stringify({ event: 'exception', notebookId, message: (e as Error).message }));
    return jsonResponse(500, { status: 'failed', notebook_id: notebookId, error: (e as Error).message });
  }
}

serve(handler);
