import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file, notebookId, sourceId) => {
    try {
      setIsUploading(true);
      
      const fileExtension = file.name.split('.').pop() || 'bin';
      const filePath = `${notebookId}/${sourceId}.${fileExtension}`;
      
      console.log('Uploading file to:', filePath);
      
      const { data, error } = await supabase.storage
        .from('sources')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('File uploaded successfully:', data);
      return filePath;
    } catch (error) {
      console.error('File upload failed:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const getFileUrl = (filePath) => {
    const { data } = supabase.storage
      .from('sources')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  return {
    uploadFile,
    getFileUrl,
    isUploading,
  };
};
