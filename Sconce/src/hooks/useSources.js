import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useSources = (notebookId) => {
  const queryClient = useQueryClient();

  const {
    data: sources = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sources', notebookId],
    queryFn: async () => {
      if (!notebookId) return [];
      
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('notebook_id', notebookId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!notebookId,
  });

  // Real-time subscription for sources updates
  useEffect(() => {
    if (!notebookId) return;

    console.log('Setting up real-time subscription for sources');

    const channel = supabase
      .channel('sources-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sources',
          filter: `notebook_id=eq.${notebookId}`
        },
        (payload) => {
          console.log('Real-time source update:', payload);
          
          queryClient.setQueryData(['sources', notebookId], (oldSources = []) => {
            switch (payload.eventType) {
              case 'INSERT':
                const newSource = payload.new;
                const exists = oldSources.some(s => s.id === newSource?.id);
                if (exists) return oldSources;
                return [newSource, ...oldSources];
                
              case 'UPDATE':
                const updated = payload.new;
                return oldSources.map(s => 
                  s.id === updated?.id ? updated : s
                );
                
              case 'DELETE':
                const deleted = payload.old;
                return oldSources.filter(s => s.id !== deleted?.id);
                
              default:
                return oldSources;
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [notebookId, queryClient]);

  const addSource = useMutation({
    mutationFn: async (sourceData) => {
      const { data, error } = await supabase
        .from('sources')
        .insert({
          notebook_id: sourceData.notebookId,
          title: sourceData.title,
          type: sourceData.type,
          source_type: sourceData.type,
          file_path: sourceData.file_path,
          file_size: sourceData.file_size,
          summary: sourceData.summary,
          processing_status: sourceData.processing_status || 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources', notebookId] });
    },
  });

  const updateSource = useMutation({
    mutationFn: async ({ sourceId, updates }) => {
      const { data, error } = await supabase
        .from('sources')
        .update(updates)
        .eq('id', sourceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  const deleteSource = useMutation({
    mutationFn: async (sourceId) => {
      const { error } = await supabase
        .from('sources')
        .delete()
        .eq('id', sourceId);

      if (error) throw error;
      return sourceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources', notebookId] });
    },
  });

  return {
    sources,
    isLoading,
    error,
    addSource: addSource.mutate,
    addSourceAsync: addSource.mutateAsync,
    isAdding: addSource.isPending,
    updateSource: updateSource.mutate,
    isUpdating: updateSource.isPending,
    deleteSource: deleteSource.mutate,
    isDeleting: deleteSource.isPending,
  };
};
