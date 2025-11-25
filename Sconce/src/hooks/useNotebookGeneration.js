import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useNotebookGeneration() {
  const queryClient = useQueryClient();

  const generateNotebookContent = useMutation({
    mutationFn: async ({ notebookId, filePath, sourceType }) => {
      const { data, error } = await supabase.functions.invoke('generate-notebook-content', {
        body: { notebookId, filePath, sourceType }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      // invalidate any single notebook queries if present
    }
  });

  return {
    generateNotebookContentAsync: generateNotebookContent.mutateAsync,
    isGenerating: generateNotebookContent.isPending,
  };
}
