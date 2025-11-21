/**
 * Supabase Client Configuration for InsightsLM Integration
 * 
 * This connects Sconce to your local InsightsLM backend
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// IMPORTANT: When using hosted Supabase, set these in Sconce/.env:
// VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
// VITE_SUPABASE_ANON_KEY=<your-anon-key>
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Do not fall back to localhost; this causes Failed to fetch when local stack isn't running
  // Surface a clear error in the console to guide configuration, but do NOT throw here.
  console.error('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.\n' +
    'Set these in Sconce/.env to your hosted Supabase project. Example:\n' +
    'VITE_SUPABASE_URL=https://<project-ref>.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=<anon-key>');
}

// Lazily initialize the client only when config exists to avoid crashing the UI at import time
let supabase = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'x-client-info': 'sconce-lms'
      }
    }
  });
}

export { supabase };

// Optional: quick connectivity check utility (use in troubleshooting)
export const checkSupabaseConnectivity = async () => {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return { ok: false, error: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY' };
    }
    if (!supabase) {
      return { ok: false, error: 'Supabase client not initialized' };
    }
    const { error } = await supabase.from('notebooks').select('id', { count: 'exact', head: true });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
};

/**
 * Database Tables Schema (for reference):
 * 
 * - notebooks: {id, user_id, title, description, icon, generation_status, week_number, created_at}
 * - sources: {id, notebook_id, source_type, file_path, title, summary, created_at}
 * - documents: {id, content, metadata (notebook_id, source_id), embedding}
 * - n8n_chat_histories: {id, session_id (maps to notebook_id), message (JSONB)}
 * - audio_overviews: {id, notebook_id, audio_url, transcript, created_at}
 * - notes: {id, notebook_id, user_id, content, created_at}
 */

// Helper functions
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const signUp = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata // Store role, name, etc.
    }
  });
  if (error) throw error;
  return data;
};
