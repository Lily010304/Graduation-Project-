import React, { useState, useCallback, useEffect } from 'react';
import { useSources } from '../../hooks/useSources';
import { useFileUpload } from '../../hooks/useFileUpload';
import { supabase } from '../../lib/supabase';
import { toast } from '../../lib/utils';

export default function AddSourcesDialog({ open, onOpenChange, notebookId }) {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);
  const { addSourceAsync, updateSource } = useSources(notebookId);
  const { uploadFile, isUploading } = useFileUpload();

  useEffect(() => {
    if (open) setIsProcessingLocal(false);
  }, [open]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFileUpload(files);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      handleFileUpload(files);
    }
  };

  const processFileAsync = async (file, sourceId) => {
    try {
      // 1) upload file to storage
      const filePath = await uploadFile(file, notebookId, sourceId);
      if (!filePath) throw new Error('Upload failed');

      // 2) update source record with file path and processing status
      await updateSource({ sourceId, updates: { file_path: filePath, processing_status: 'processing' } });

      // 3) call Supabase function to process this source (n8n)
      const { data, error } = await supabase.functions.invoke('process-additional-sources', {
        body: {
          type: 'file',
          notebookId,
          sourceIds: [sourceId],
        }
      });
      if (error) throw error;

      return data;
    } catch (err) {
      console.error('processFileAsync error', err);
      await updateSource({ sourceId, updates: { processing_status: 'failed' } });
      throw err;
    }
  };

  const handleFileUpload = async (files) => {
    if (!notebookId) return toast({ title: 'Error', description: 'No notebook selected', variant: 'destructive' });
    setIsProcessingLocal(true);

    try {
      // Create source records first
      const created = await Promise.all(files.map(async (file) => {
        const type = file.type.includes('pdf') ? 'pdf' : file.type.includes('audio') ? 'audio' : 'text';
        return await addSourceAsync({ notebookId, title: file.name, type, file_size: file.size, processing_status: 'pending' });
      }));

      // Close dialog and process in background
      onOpenChange(false);
      setIsProcessingLocal(false);

      // Start processing concurrently
      await Promise.allSettled(created.map((source, idx) => processFileAsync(files[idx], source.id)));
      toast({ title: 'Files added', description: `${files.length} file(s) queued for processing` });
    } catch (err) {
      console.error('handleFileUpload error', err);
      toast({ title: 'Error', description: 'Failed to add files', variant: 'destructive' });
      setIsProcessingLocal(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white w-11/12 max-w-3xl rounded shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Add Sources</h3>
          <button className="text-sm text-gray-600" onClick={() => onOpenChange(false)}>Close</button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <p className="mb-2">Drag & drop files here or <button className="text-blue-600 underline" onClick={() => document.getElementById('sconce-file-upload')?.click()}>choose files</button></p>
          <p className="text-sm text-gray-500">Supported: PDF, .txt, .md, .mp3</p>
          <input id="sconce-file-upload" type="file" multiple className="hidden" accept=".pdf,.txt,.md,.mp3,.wav,.m4a" onChange={handleFileSelect} />
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button className="px-3 py-1 border rounded" onClick={() => onOpenChange(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
