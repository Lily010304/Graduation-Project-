import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useNotes(notebookId) {
  const queryClient = useQueryClient();

  const { data: notes, isLoading, error, refetch } = useQuery({
    queryKey: ['notes', notebookId],
    queryFn: async () => {
      if (!notebookId) return [];
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('notebook_id', notebookId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!notebookId,
  });

  const createNoteMutation = useMutation({
    mutationFn: async ({ title, content, source_type = 'user' }) => {
      if (!notebookId) throw new Error('No notebook ID');
      const { data, error } = await supabase
        .from('notes')
        .insert({
          notebook_id: notebookId,
          title,
          content,
          source_type,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, title, content }) => {
      const { data, error } = await supabase
        .from('notes')
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] });
    },
  });

  return {
    notes,
    isLoading,
    error,
    refetch,
    createNote: createNoteMutation.mutate,
    updateNote: updateNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
  };
}
