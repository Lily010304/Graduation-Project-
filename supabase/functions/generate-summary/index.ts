import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { notebook_id } = await req.json()

    if (!notebook_id) {
      throw new Error('notebook_id is required')
    }

    // Get n8n webhook URL from environment
    const N8N_WEBHOOK_URL = Deno.env.get('N8N_SUMMARY_WEBHOOK_URL')
    const NOTEBOOK_GENERATION_AUTH = Deno.env.get('NOTEBOOK_GENERATION_AUTH')

    if (!N8N_WEBHOOK_URL) {
      console.error('N8N_SUMMARY_WEBHOOK_URL not configured in secrets')
      throw new Error('N8N_SUMMARY_WEBHOOK_URL not configured')
    }

    if (!NOTEBOOK_GENERATION_AUTH) {
      console.error('NOTEBOOK_GENERATION_AUTH not configured in secrets')
      throw new Error('NOTEBOOK_GENERATION_AUTH not configured')
    }

    console.log('Calling n8n summary workflow for notebook:', notebook_id)
    console.log('Webhook URL:', N8N_WEBHOOK_URL)

    // Call n8n workflow
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': NOTEBOOK_GENERATION_AUTH || '',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        notebook_id,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('n8n workflow error:', errorText)
      throw new Error(`Workflow failed: ${response.status} ${errorText}`)
    }

    const result = await response.json()

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in generate-summary function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
