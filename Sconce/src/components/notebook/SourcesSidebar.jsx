import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSources } from '../../hooks/useSources';
import AddSourcesDialog from './AddSourcesDialog';
import SourceContentViewer from './SourceContentViewer';

export default function SourcesSidebar({ notebookId, hasSource }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const { sources, isLoading, deleteSource } = useSources(notebookId);

  const handleContextMenu = (e, source) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, source });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDeleteSource = async (sourceId) => {
    if (window.confirm('Are you sure you want to remove this source?')) {
      await deleteSource.mutateAsync(sourceId);
    }
    setContextMenu(null);
  };

  const handleSourceClick = (source) => {
    setSelectedSource(source);
  };

  const handleBackToSources = () => {
    setSelectedSource(null);
  };

  const renderSourceIcon = (type) => {
    const icons = {
      'pdf': '📄',
      'text': '📝',
      'website': '🌐',
      'youtube': '🎵',
      'audio': '🎵',
      'doc': '📄'
    };
    return icons[type] || '📄';
  };

  const renderProcessingStatus = (status) => {
    switch (status) {
      case 'uploading':
      case 'processing':
      case 'pending':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>;
      case 'completed':
        return <span className="text-green-500">✓</span>;
      case 'failed':
        return <span className="text-red-500">✕</span>;
      default:
        return null;
    }
  };

  // Show source content viewer when a source is selected
  if (selectedSource) {
    return (
      <div className="w-full bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 
              className="text-lg font-medium text-gray-900 cursor-pointer hover:text-gray-700" 
              onClick={handleBackToSources}
            >
              Sources
            </h2>
            <button 
              onClick={handleBackToSources} 
              className="p-2 hover:bg-gray-100 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="M440-440v240h-80v-160H200v-80h240Zm160-320v160h160v80H520v-240h80Z" />
              </svg>
            </button>
          </div>
        </div>
        
        <SourceContentViewer 
          source={selectedSource}
          sourceContent={selectedSource.content}
          sourceSummary={selectedSource.summary}
          sourceUrl={selectedSource.url}
          className="flex-1 overflow-hidden" 
          isOpenedFromSourceList={true}
          onClose={handleBackToSources}
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Sources</h2>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex-1 flex items-center justify-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">Loading sources...</p>
            </div>
          ) : sources && sources.length > 0 ? (
            <div className="space-y-4">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 bg-white"
                  onClick={() => handleSourceClick(source)}
                  onContextMenu={(e) => handleContextMenu(e, source)}
                >
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="w-6 h-6 bg-white rounded border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">{renderSourceIcon(source.type || source.source_type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-900 truncate block">{source.title || source.file_path}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 py-[4px]">
                      {renderProcessingStatus(source.processing_status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Saved sources will appear here</h3>
              <p className="text-sm text-gray-600 mb-4">Click Add source above to add PDFs, text, or audio files.</p>
            </div>
          )}
        </div>
      </div>

      {contextMenu && (
        <div 
          style={{ left: contextMenu.x, top: contextMenu.y }} 
          className="fixed z-50 bg-white border rounded shadow-lg p-1"
        >
          <button 
            className="block w-full px-3 py-2 text-sm text-left hover:bg-gray-100 text-red-600" 
            onClick={() => handleDeleteSource(contextMenu.source.id)}
          >
            Remove source
          </button>
        </div>
      )}

      <AddSourcesDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
        notebookId={notebookId} 
      />
    </div>
  );
}
