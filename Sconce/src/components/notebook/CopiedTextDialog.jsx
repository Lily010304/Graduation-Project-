import React, { useState, useEffect } from 'react';
import { Copy, ClipboardPaste, X } from 'lucide-react';

export default function CopiedTextDialog({ open, onOpenChange, onSubmit }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-populate with clipboard content when dialog opens
  useEffect(() => {
    if (open) {
      navigator.clipboard.readText()
        .then(text => {
          if (text && text.trim()) {
            setContent(text);
            const words = text.trim().split(' ').slice(0, 8).join(' ');
            setTitle(words.length > 50 ? words.substring(0, 50) + '...' : words);
          }
        })
        .catch(err => {
          console.log('Could not read clipboard:', err);
        });
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(title.trim(), content.trim());
      setTitle('');
      setContent('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting copied text:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    onOpenChange(false);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setContent(text);
        if (!title.trim()) {
          const words = text.trim().split(' ').slice(0, 8).join(' ');
          setTitle(words.length > 50 ? words.substring(0, 50) + '...' : words);
        }
      }
    } catch (err) {
      console.error('Could not read clipboard:', err);
    }
  };

  const isValid = title.trim() !== '' && content.trim() !== '';
  const characterCount = content.length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Copy className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-medium">Add Copied Text</h3>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            This dialog automatically reads from your clipboard. You can also manually paste content below.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              placeholder="Enter a title for this content..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Content</label>
              <button
                onClick={handlePasteFromClipboard}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <ClipboardPaste className="h-4 w-4" />
                <span>Paste from Clipboard</span>
              </button>
            </div>
            <textarea
              placeholder="Your copied content will appear here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] resize-y"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{characterCount} characters</span>
              {characterCount > 10000 && (
                <span className="text-amber-600">Large content may take longer to process</span>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={!isValid || isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Copied Text'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
