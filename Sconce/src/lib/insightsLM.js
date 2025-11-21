/**
 * InsightsLM API Integration
 * 
 * Communicates with n8n workflows and Supabase Edge Functions
 * to provide AI-powered notebook features
 */

import { supabase } from './supabase';

// Ensure Supabase client is initialized before any operation
const ensureClient = () => {
  if (!supabase) {
    throw new Error(
      'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Sconce/.env, then restart the dev server.'
    );
  }
  return supabase;
};

// n8n Webhook URLs (using ngrok for external access)
const N8N_BASE_URL = import.meta.env.VITE_N8N_URL || 'https://gracelessly-factious-herb.ngrok-free.dev/webhook';
const AUTH_HEADER = import.meta.env.VITE_N8N_AUTH || '395ca650972342ee8a4778957ffed288294c6400827d4eb8b455f8f87edfe03b';

/**
 * ============================================
 * NOTEBOOK MANAGEMENT
 * ============================================
 */

/**
 * Create a new notebook for a specific week
 */
export const createNotebook = async (weekNumber, userId, metadata = {}) => {
  const client = ensureClient();
  if (!weekNumber && weekNumber !== 0) throw new Error('weekNumber is required');
  if (!userId) throw new Error('userId is required');

  try {
    // Basic connectivity check (optional)
    const ping = await client.from('notebooks').select('id', { head: true, count: 'exact' });
    if (ping.error) {
      console.warn('Connectivity check failed before insert:', ping.error.message);
    }

    const insertPayload = {
      user_id: userId,
      week_number: weekNumber,
      title: metadata.title || `Week ${weekNumber} - Arabic Learning`,
      description: metadata.description || '',
      generation_status: 'pending',
      icon: metadata.icon || '📚'
    };
    
    const { data, error } = await client
      .from('notebooks')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('[createNotebook] Supabase insert error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    return data;
  } catch (err) {
    // Differentiate fetch/network errors
    if (err instanceof TypeError && err.message.includes('fetch')) {
      console.error('[createNotebook] Network/Fetch error:', err);
      throw new Error('Network error: Unable to reach Supabase. Check VITE_SUPABASE_URL accessibility and CORS.');
    }
    console.error('[createNotebook] Unexpected error:', err);
    throw err;
  }
};

/**
 * Get all notebooks for a user
 */
export const getUserNotebooks = async (userId, filters = {}) => {
  const client = ensureClient();
  let query = client
    .from('notebooks')
    .select('*, sources(count)')
    .eq('user_id', userId)
    .order('week_number', { ascending: true });

  if (filters.weekNumber) {
    query = query.eq('week_number', filters.weekNumber);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Get a specific notebook with all its sources
 */
export const getNotebookWithSources = async (notebookId) => {
  const client = ensureClient();
  const { data, error } = await client
    .from('notebooks')
    .select(`
      *,
      sources (
        id,
        source_type,
        title,
        summary,
        file_path,
        created_at
      )
    `)
    .eq('id', notebookId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * ============================================
 * RESOURCE UPLOAD & PROCESSING
 * ============================================
 */

/**
 * Upload a file (PDF, DOCX, YouTube URL, etc.) to a notebook
 */
export const uploadSource = async (notebookId, file, sourceType) => {
  const client = ensureClient();
  // 1. Upload file to Supabase Storage
  const fileName = `${notebookId}/${Date.now()}_${file.name}`;
  const { data: uploadData, error: uploadError } = await client.storage
    .from('sources')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // 2. Create source record
  const { data: sourceData, error: sourceError } = await client
    .from('sources')
    .insert({
      notebook_id: notebookId,
      source_type: sourceType,
      file_path: fileName,
      title: file.name,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (sourceError) throw sourceError;

  // 3. Trigger processing workflow (extracts text, generates embeddings)
  await triggerSourceProcessing(notebookId, sourceData.id, sourceType);

  return sourceData;
};

/**
 * Add YouTube video as source
 */
export const addYouTubeSource = async (notebookId, youtubeUrl) => {
  const client = ensureClient();
  const { data, error } = await client
    .from('sources')
    .insert({
      notebook_id: notebookId,
      source_type: 'youtube',
      file_path: youtubeUrl,
      title: 'YouTube Video',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  // Trigger processing
  await triggerSourceProcessing(notebookId, data.id, 'youtube');

  return data;
};

/**
 * Trigger n8n workflow to process uploaded source
 * (Extract text → Generate embeddings → Upsert to vector store)
 */
const triggerSourceProcessing = async (notebookId, sourceId, sourceType) => {
  const response = await fetch(`${N8N_BASE_URL}/process-source`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': AUTH_HEADER
    },
    body: JSON.stringify({
      notebookId,
      sourceId,
      sourceType
    })
  });

  if (!response.ok) throw new Error('Failed to trigger source processing');
  return await response.json();
};

/**
 * ============================================
 * CHAT WITH RAG (CITATIONS)
 * ============================================
 */

/**
 * Send a message to the notebook chat (RAG with citations)
 */
export const sendChatMessage = async (notebookId, message, userId) => {
  const client = ensureClient();
  // Call Supabase Edge Function (which calls n8n webhook)
  const { data, error } = await client.functions.invoke('send-chat-message', {
    body: {
      session_id: notebookId, // notebook_id is used as session_id
      message,
      user_id: userId
    }
  });

  if (error) throw error;
  return data;
};

/**
 * Get chat history for a notebook
 */
export const getChatHistory = async (notebookId) => {
  const client = ensureClient();
  const { data, error } = await client
    .from('n8n_chat_histories')
    .select('*')
    .eq('session_id', notebookId)
    .order('id', { ascending: true });

  if (error) throw error;

  // Transform messages to readable format
  return data.map(item => ({
    id: item.id,
    type: item.message.type, // 'human' or 'ai'
    content: item.message.type === 'ai' 
      ? JSON.parse(item.message.content).output 
      : item.message.content,
    created_at: item.created_at
  }));
};

/**
 * Subscribe to real-time chat updates
 */
export const subscribeToChatUpdates = (notebookId, callback) => {
  const client = ensureClient();
  const channel = client
    .channel(`chat:${notebookId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'n8n_chat_histories',
        filter: `session_id=eq.${notebookId}`
      },
      (payload) => {
        const message = {
          id: payload.new.id,
          type: payload.new.message.type,
          content: payload.new.message.type === 'ai'
            ? JSON.parse(payload.new.message.content).output
            : payload.new.message.content,
          created_at: payload.new.created_at
        };
        callback(message);
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
};

/**
 * ============================================
 * PODCAST GENERATION
 * ============================================
 */

/**
 * Generate AI podcast from notebook sources
 */
export const generatePodcast = async (notebookId) => {
  const client = ensureClient();
  const { data, error } = await client.functions.invoke('generate-audio-overview', {
    body: { notebookId }
  });

  if (error) throw error;
  return data;
};

/**
 * Get generated podcasts for a notebook
 */
export const getNotebookPodcasts = async (notebookId) => {
  const client = ensureClient();
  const { data, error } = await client
    .from('audio_overviews')
    .select('*')
    .eq('notebook_id', notebookId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * ============================================
 * NOTES MANAGEMENT
 * ============================================
 */

/**
 * Save a note to a notebook
 */
export const saveNote = async (notebookId, userId, content) => {
  const client = ensureClient();
  const { data, error } = await client
    .from('notes')
    .insert({
      notebook_id: notebookId,
      user_id: userId,
      content,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get all notes for a notebook
 */
export const getNotebookNotes = async (notebookId) => {
  const client = ensureClient();
  const { data, error } = await client
    .from('notes')
    .select('*')
    .eq('notebook_id', notebookId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Update a note
 */
export const updateNote = async (noteId, content) => {
  const client = ensureClient();
  const { data, error } = await client
    .from('notes')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', noteId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a note
 */
export const deleteNote = async (noteId) => {
  const client = ensureClient();
  const { error } = await client
    .from('notes')
    .delete()
    .eq('id', noteId);

  if (error) throw error;
};

/**
 * ============================================
 * QUIZ & SUMMARY GENERATION (TODO)
 * ============================================
 */

/**
 * Generate quiz questions from notebook content
 */
export const generateQuiz = async (notebookId, options = {}) => {
  // TODO: Create n8n workflow for quiz generation
  const response = await fetch(`${N8N_BASE_URL}/generate-quiz`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': AUTH_HEADER
    },
    body: JSON.stringify({
      notebookId,
      questionCount: options.questionCount || 10,
      difficulty: options.difficulty || 'medium',
      language: 'arabic'
    })
  });

  if (!response.ok) throw new Error('Failed to generate quiz');
  return await response.json();
};

/**
 * Generate summary of notebook content
 */
export const generateSummary = async (notebookId) => {
  // TODO: Create n8n workflow for summary generation
  const response = await fetch(`${N8N_BASE_URL}/generate-summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': AUTH_HEADER
    },
    body: JSON.stringify({
      notebookId,
      language: 'arabic'
    })
  });

  if (!response.ok) throw new Error('Failed to generate summary');
  return await response.json();
};
