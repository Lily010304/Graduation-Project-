import React, { useState } from 'react';
import { Link, X } from 'lucide-react';

export default function MultipleWebsiteUrlsDialog({ open, onOpenChange, onSubmit }) {
  const [urlsText, setUrlsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const urls = urlsText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url !== '');
    
    if (urls.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(urls);
      setUrlsText('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting URLs:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setUrlsText('');
    onOpenChange(false);
  };

  const validUrls = urlsText
    .split('\n')
    .map(url => url.trim())
    .filter(url => url !== '');
  
  const isValid = validUrls.length > 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium">Add Multiple Website URLs</h3>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Website URLs</label>
            <p className="text-sm text-gray-600 mt-1 mb-3">
              Enter multiple website URLs, one per line. Each URL will be scraped as a separate source.
            </p>
          </div>

          <div>
            <textarea
              placeholder={`Enter URLs one per line, for example:
https://example.com
https://another-site.com
https://third-website.org`}
              value={urlsText}
              onChange={(e) => setUrlsText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32 resize-y"
              rows={6}
            />
            {validUrls.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {validUrls.length} URL{validUrls.length !== 1 ? 's' : ''} detected
              </p>
            )}
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
              {isSubmitting ? 'Adding...' : `Add ${validUrls.length} Website${validUrls.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
