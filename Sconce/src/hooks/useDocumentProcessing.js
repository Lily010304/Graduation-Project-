import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useDocumentProcessing() {
  const processDocument = useMutation({
    mutationFn: async ({ sourceId, filePath, sourceType }) => {
      const { data, error } = await supabase.functions.invoke('process-document', {
        body: { sourceId, filePath, sourceType }
      });
      if (error) throw error;
      return data;
    }
  });

  return {
    processDocumentAsync: processDocument.mutateAsync,
    isProcessing: processDocument.isPending,
  };
}
