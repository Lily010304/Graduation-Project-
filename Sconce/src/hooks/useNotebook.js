import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useNotebook(notebookId) {
  const queryClient = useQueryClient();

  const { data: notebook, isLoading, error } = useQuery({
    queryKey: ['notebook', notebookId],
    queryFn: async () => {
      if (!notebookId) return null;
      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .eq('id', notebookId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!notebookId,
  });

  const updateNotebookMutation = useMutation({
    mutationFn: async (updates) => {
      if (!notebookId) throw new Error('No notebook ID');
      const { data, error } = await supabase
        .from('notebooks')
        .update(updates)
        .eq('id', notebookId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebook', notebookId] });
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
    },
  });

  return {
    notebook,
    isLoading,
    error,
    updateNotebook: updateNotebookMutation.mutate,
    isUpdating: updateNotebookMutation.isPending,
  };
}
