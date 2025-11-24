import React from 'react';

/**
 * Minimal SourceContentViewer implementation for notebook sidebar.
 * Shows summary (if present) and full content with basic scroll.
 */
export default function SourceContentViewer({ source, sourceContent, sourceSummary, sourceUrl, onClose, className = '' }) {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 truncate">{source?.title || source?.file_path || 'Source'}</h3>
          {sourceUrl && <a href={sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Open original</a>}
        </div>
        <button onClick={onClose} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Back</button>
      </div>

      <div className="flex-1 overflow-auto space-y-6 p-4 bg-gray-50">
        {sourceSummary && (
          <div className="bg-white border rounded-lg p-3">
            <h4 className="text-xs font-semibold mb-2 tracking-wide text-gray-700">AI Summary</h4>
            <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">{sourceSummary}</p>
          </div>
        )}

        <div className="bg-white border rounded-lg p-3">
          <h4 className="text-xs font-semibold mb-2 tracking-wide text-gray-700">Full Content</h4>
          {sourceContent ? (
            <pre className="text-xs leading-relaxed font-mono whitespace-pre-wrap text-gray-800">
              {sourceContent}
            </pre>
          ) : (
            <p className="text-xs text-gray-500 italic">No content available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
