import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Link, Copy, X } from 'lucide-react';
import { useSources } from '../../hooks/useSources';
import { useFileUpload } from '../../hooks/useFileUpload';
import { supabase } from '../../lib/supabase';
import CopiedTextDialog from './CopiedTextDialog';
import MultipleWebsiteUrlsDialog from './MultipleWebsiteUrlsDialog';
import { useDocumentProcessing } from '../../hooks/useDocumentProcessing';
import { useNotebookGeneration } from '../../hooks/useNotebookGeneration';

export default function AddSourcesDialog({ open, onOpenChange, notebookId }) {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);
  const [showCopiedTextDialog, setShowCopiedTextDialog] = useState(false);
  const [showMultipleWebsiteDialog, setShowMultipleWebsiteDialog] = useState(false);
  
  const { addSourceAsync, updateSource } = useSources(notebookId);
  const { uploadFile } = useFileUpload();
  const { processDocumentAsync } = useDocumentProcessing();
  const { generateNotebookContentAsync } = useNotebookGeneration();

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
      // Determine sourceType
      const sourceType = file.type.includes('pdf') ? 'pdf' : file.type.includes('audio') ? 'audio' : 'text';

      // Upload
      const filePath = await uploadFile(file, notebookId, sourceId);
      if (!filePath) throw new Error('Upload failed');

      // Update to processing
      await updateSource({ sourceId, updates: { file_path: filePath, processing_status: 'processing' } });

      // Kick off document processing (extract + upsert vector store)
      await processDocumentAsync({ sourceId, filePath, sourceType });

      // Generate / update notebook metadata (title / description) based on first source only
      await generateNotebookContentAsync({ notebookId, filePath, sourceType });

      // Mark completed (will later be replaced by webhook callback if implemented)
      await updateSource({ sourceId, updates: { processing_status: 'completed' } });
    } catch (err) {
      console.error('processFileAsync error', err);
      await updateSource({ sourceId, updates: { processing_status: 'failed' } });
    }
  };

  const handleFileUpload = async (files) => {
    if (!notebookId) return;
    setIsProcessingLocal(true);

    try {
      // Create sources first (pending)
      const created = await Promise.all(files.map(async (file) => {
        const type = file.type.includes('pdf') ? 'pdf' : file.type.includes('audio') ? 'audio' : 'text';
        return await addSourceAsync({
          notebookId,
          title: file.name,
          type,
          file_size: file.size,
          processing_status: 'pending'
        });
      }));

      // Close dialog quickly for UX
      onOpenChange(false);

      // Process sequentially to avoid rate limits (first triggers notebook generation reliably)
      for (let i = 0; i < created.length; i++) {
        await processFileAsync(files[i], created[i].id);
      }

      setIsProcessingLocal(false);
    } catch (err) {
      console.error('handleFileUpload error', err);
      setIsProcessingLocal(false);
    }
  };

  const handleTextSubmit = async (title, content) => {
    if (!notebookId) return;
    setIsProcessingLocal(true);

    try {
      const createdSource = await addSourceAsync({
        notebookId,
        title,
        type: 'text',
        content,
        processing_status: 'pending',
      });

      // Simulate filePath for text (none) - call notebook generation directly
      await updateSource({ sourceId: createdSource.id, updates: { processing_status: 'processing' } });
      await generateNotebookContentAsync({ notebookId, sourceType: 'text' });
      await updateSource({ sourceId: createdSource.id, updates: { processing_status: 'completed' } });
      onOpenChange(false);
    } finally {
      setIsProcessingLocal(false);
    }
  };

  const handleMultipleWebsiteSubmit = async (urls) => {
    if (!notebookId) return;
    setIsProcessingLocal(true);

    try {
      const created = await Promise.all(urls.map(async (url, idx) => {
        return await addSourceAsync({
          notebookId,
          title: `Website ${idx + 1}: ${url}`,
          type: 'website',
          url,
          processing_status: 'pending',
        });
      }));

      // Sequential processing (no file paths) just mark completed & generate notebook once
      for (let i = 0; i < created.length; i++) {
        await updateSource({ sourceId: created[i].id, updates: { processing_status: 'processing' } });
        await updateSource({ sourceId: created[i].id, updates: { processing_status: 'completed' } });
      }
      await generateNotebookContentAsync({ notebookId, sourceType: 'website' });
      onOpenChange(false);
    } finally {
      setIsProcessingLocal(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#FFFFFF">
                    <path d="M480-80q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-200v-80h320v80H320Zm10-120q-69-41-109.5-110T180-580q0-125 87.5-212.5T480-880q125 0 212.5 87.5T780-580q0 81-40.5 150T630-320H330Zm24-80h252q45-32 69.5-79T700-580q0-92-64-156t-156-64q-92 0-156 64t-64 156q0 54 24.5 101t69.5 79Zm126 0Z" />
                  </svg>
                </div>
                <h2 className="text-xl font-medium">InsightsLM</h2>
              </div>
              <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2">Add sources</h3>
              <p className="text-gray-600 text-sm mb-1">
                Sources let InsightsLM base its responses on the information that matters most to you.
              </p>
              <p className="text-gray-500 text-xs">
                (Examples: marketing plans, course reading, research notes, meeting transcripts, sales documents, etc.)
              </p>
            </div>

            {/* File Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              } ${isProcessingLocal ? 'opacity-50 pointer-events-none' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100">
                  <Upload className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {isProcessingLocal ? 'Processing files...' : 'Upload sources'}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {isProcessingLocal ? (
                      'Please wait while we process your files'
                    ) : (
                      <>
                        Drag & drop or{' '}
                        <button 
                          className="text-blue-600 hover:underline" 
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          choose file
                        </button>{' '}
                        to upload
                      </>
                    )}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  Supported file types: PDF, txt, Markdown, Audio (e.g. mp3)
                </p>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.txt,.md,.mp3,.wav,.m4a"
                  onChange={handleFileSelect}
                  disabled={isProcessingLocal}
                />
              </div>
            </div>

            {/* Integration Options */}
            <div className="grid grid-cols-2 gap-4">
              <button
                className="h-auto p-4 flex flex-col items-center space-y-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => setShowMultipleWebsiteDialog(true)}
                disabled={isProcessingLocal}
              >
                <Link className="h-6 w-6 text-green-600" />
                <span className="font-medium">Link - Website</span>
                <span className="text-sm text-gray-500">Multiple URLs at once</span>
              </button>

              <button
                className="h-auto p-4 flex flex-col items-center space-y-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => setShowCopiedTextDialog(true)}
                disabled={isProcessingLocal}
              >
                <Copy className="h-6 w-6 text-purple-600" />
                <span className="font-medium">Paste Text - Copied Text</span>
                <span className="text-sm text-gray-500">Add copied content</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-dialogs */}
      <CopiedTextDialog 
        open={showCopiedTextDialog} 
        onOpenChange={setShowCopiedTextDialog} 
        onSubmit={handleTextSubmit} 
      />

      <MultipleWebsiteUrlsDialog 
        open={showMultipleWebsiteDialog} 
        onOpenChange={setShowMultipleWebsiteDialog} 
        onSubmit={handleMultipleWebsiteSubmit} 
      />
    </>
  );
}
