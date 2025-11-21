import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useNotebooks = (userId) => {
  const queryClient = useQueryClient();

  const {
    data: notebooks = [],
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ['notebooks', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('No user ID provided, returning empty notebooks array');
        return [];
      }
      
      console.log('Fetching notebooks for user:', userId);
      
      // Get notebooks
      const { data: notebooksData, error: notebooksError } = await supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (notebooksError) {
        console.error('Error fetching notebooks:', notebooksError);
        throw notebooksError;
      }

      // Get source counts for each notebook
      const notebooksWithCounts = await Promise.all(
        (notebooksData || []).map(async (notebook) => {
          const { count, error: countError } = await supabase
            .from('sources')
            .select('*', { count: 'exact', head: true })
            .eq('notebook_id', notebook.id);

          if (countError) {
            console.error('Error fetching source count:', countError);
            return { ...notebook, sourceCount: 0 };
          }

          return { ...notebook, sourceCount: count || 0 };
        })
      );

      console.log('Fetched notebooks:', notebooksWithCounts?.length || 0);
      return notebooksWithCounts || [];
    },
    enabled: !!userId,
    retry: 3,
  });

  // Real-time subscription for notebooks updates
  useEffect(() => {
    if (!userId) return;

    console.log('Setting up real-time subscription for notebooks');

    const channel = supabase
      .channel('notebooks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notebooks',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Real-time notebook update:', payload);
          queryClient.invalidateQueries({ queryKey: ['notebooks', userId] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const createNotebook = useMutation({
    mutationFn: async (notebookData) => {
      console.log('Creating notebook:', notebookData);
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('notebooks')
        .insert({
          title: notebookData.title,
          description: notebookData.description,
          week_number: notebookData.week_number,
          user_id: userId,
          icon: notebookData.icon || '📚',
          generation_status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notebook:', error);
        throw error;
      }
      
      console.log('Notebook created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks', userId] });
    },
  });

  return {
    notebooks,
    isLoading,
    error: error?.message || null,
    isError,
    createNotebook: createNotebook.mutate,
    createNotebookAsync: createNotebook.mutateAsync,
    isCreating: createNotebook.isPending,
  };
};
