import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Transform message from database format to display format
const transformMessage = (item, sourceMap) => {
  console.log('Processing message:', item);
  
  let transformedMessage;
  
  if (item.message && typeof item.message === 'object' && 'type' in item.message) {
    const messageObj = item.message;
    
    // Check if AI message with JSON content
    if (messageObj.type === 'ai' && typeof messageObj.content === 'string') {
      try {
        const parsedContent = JSON.parse(messageObj.content);
        
        if (parsedContent.output && Array.isArray(parsedContent.output)) {
          // Transform to segments and citations format
          const segments = [];
          const citations = [];
          let citationIdCounter = 1;
          
          parsedContent.output.forEach((outputItem) => {
            segments.push({
              text: outputItem.sentence_paragraph_with_citation || outputItem.text,
              citation_id: outputItem.citations && outputItem.citations.length > 0 ? citationIdCounter : undefined
            });
            
            if (outputItem.citations && outputItem.citations.length > 0) {
              outputItem.citations.forEach((citation) => {
                const sourceInfo = sourceMap.get(citation.chunk_source_id);
                citations.push({
                  citation_id: citationIdCounter,
                  source_id: citation.chunk_source_id,
                  source_title: sourceInfo?.title || 'Unknown Source',
                  source_type: sourceInfo?.source_type || 'pdf',
                  chunk_lines_from: citation.chunk_lines_from,
                  chunk_lines_to: citation.chunk_lines_to,
                  chunk_index: citation.chunk_index,
                });
              });
              citationIdCounter++;
            }
          });
          
          transformedMessage = {
            type: 'ai',
            content: {
              segments,
              citations
            },
          };
        } else {
          transformedMessage = {
            type: 'ai',
            content: messageObj.content,
          };
        }
      } catch (parseError) {
        console.log('Failed to parse AI content, treating as plain text');
        transformedMessage = {
          type: 'ai',
          content: messageObj.content,
        };
      }
    } else {
      transformedMessage = {
        type: messageObj.type === 'human' ? 'human' : 'ai',
        content: messageObj.content || 'Empty message',
      };
    }
  } else if (typeof item.message === 'string') {
    transformedMessage = {
      type: 'human',
      content: item.message
    };
  } else {
    transformedMessage = {
      type: 'human',
      content: 'Unable to parse message'
    };
  }

  return {
    id: item.id,
    session_id: item.session_id,
    message: transformedMessage,
    created_at: item.created_at
  };
};

export const useChatMessages = (notebookId) => {
  const queryClient = useQueryClient();

  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chat-messages', notebookId],
    queryFn: async () => {
      if (!notebookId) return [];
      
      const { data, error } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', notebookId)
        .order('id', { ascending: true });

      if (error) throw error;
      
      // Fetch sources for proper transformation
      const { data: sourcesData } = await supabase
        .from('sources')
        .select('id, title, source_type')
        .eq('notebook_id', notebookId);
      
      const sourceMap = new Map(sourcesData?.map(s => [s.id, s]) || []);
      
      return data.map((item) => transformMessage(item, sourceMap));
    },
    enabled: !!notebookId,
    refetchOnMount: true,
  });

  // Real-time subscription for new messages
  useEffect(() => {
    if (!notebookId) return;

    console.log('Setting up real-time subscription for chat');

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'n8n_chat_histories',
          filter: `session_id=eq.${notebookId}`
        },
        async (payload) => {
          console.log('Real-time: New message received:', payload);
          
          // Fetch sources for transformation
          const { data: sourcesData } = await supabase
            .from('sources')
            .select('id, title, source_type')
            .eq('notebook_id', notebookId);
          
          const sourceMap = new Map(sourcesData?.map(s => [s.id, s]) || []);
          const newMessage = transformMessage(payload.new, sourceMap);
          
          queryClient.setQueryData(['chat-messages', notebookId], (oldMessages = []) => {
            const exists = oldMessages.some(msg => msg.id === newMessage.id);
            if (exists) return oldMessages;
            return [...oldMessages, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [notebookId, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async ({ notebookId, content }) => {
      // Call n8n webhook
      const N8N_URL = import.meta.env.VITE_N8N_URL || 'https://gracelessly-factious-herb.ngrok-free.dev/webhook';
      const AUTH_TOKEN = import.meta.env.VITE_N8N_AUTH || '395ca650972342ee8a4778957ffed288294c6400827d4eb8b455f8f87edfe03b';
      
      const response = await fetch(`${N8N_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        body: JSON.stringify({
          session_id: notebookId,
          message: content
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    },
  });

  const deleteChatHistory = useMutation({
    mutationFn: async (notebookId) => {
      const { error } = await supabase
        .from('n8n_chat_histories')
        .delete()
        .eq('session_id', notebookId);

      if (error) throw error;
      return notebookId;
    },
    onSuccess: (notebookId) => {
      queryClient.setQueryData(['chat-messages', notebookId], []);
      queryClient.invalidateQueries({ queryKey: ['chat-messages', notebookId] });
    },
  });

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessage.mutate,
    sendMessageAsync: sendMessage.mutateAsync,
    isSending: sendMessage.isPending,
    deleteChatHistory: deleteChatHistory.mutate,
    isDeletingChatHistory: deleteChatHistory.isPending,
  };
};
