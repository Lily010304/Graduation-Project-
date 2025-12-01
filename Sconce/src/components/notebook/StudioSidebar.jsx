import React, { useState } from 'react';
import { Plus, ChevronRight, ChevronLeft, FileText, X } from 'lucide-react';
import { useNotes } from '../../hooks/useNotes';
import { useSources } from '../../hooks/useSources';
import * as Dialog from '@radix-ui/react-dialog';
import ReactMarkdown from 'react-markdown';

export default function StudioSidebar({ notebookId, onCitationClick, isVisible, onToggle }) {
  const [loading, setLoading] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const { notes, isLoading, refetch } = useNotes(notebookId);
  const { sources } = useSources(notebookId);
  
  const hasProcessedSource = sources?.some(source => source.processing_status === 'completed') || false;

  const handleGenerateSummary = async () => {
    if (!notebookId || !hasProcessedSource) return;
    setLoading(true);
    try {
      const SUPABASE_URL = 'https://yuopifjsxagpqcywgddi.supabase.co';
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ notebook_id: notebookId })
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const result = await response.json();
      console.log('Summary generated:', result);
      
      // Refetch notes to show the new summary
      await refetch();
    } catch (e) {
      console.error('Failed to generate summary', e);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-50 border-l border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Studio</h2>
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            title="Toggle sidebar"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        {/* Summarizer Card */}
        <div className="p-4 mb-4 border border-gray-200 rounded-lg bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Summarizer</h3>
          </div>

          <div className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded flex items-center justify-center bg-blue-50">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">AI Summary</h4>
                <p className="text-sm text-gray-600">Generate comprehensive summary</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={handleGenerateSummary}
                disabled={loading || !hasProcessedSource}
                className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating...
                  </span>
                ) : (
                  'Generate Summary'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Notes</h3>
          </div>
          
          <button className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 flex items-center justify-center">
            <Plus className="h-4 w-4 mr-2" />
            Add note
          </button>
        </div>
      </div>

      {/* Saved Notes Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">Loading notes...</p>
            </div>
          ) : notes && notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note, index) => (
                <div 
                  key={note.id} 
                  onClick={() => setSelectedNote(note)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer bg-white transition-colors"
                >
                  <h4 className="font-medium text-gray-900 truncate">
                    {note.title === 'AI-Generated Summary' ? `Summary ${notes.length - index}` : note.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {note.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Saved notes will appear here</h3>
              <p className="text-sm text-gray-600">
                Save a chat message to create a new note, or click Add note above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Note Viewer Dialog */}
      <Dialog.Root open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {selectedNote?.title}
              </Dialog.Title>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </Dialog.Close>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold text-gray-900 mt-5 mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2" {...props} />,
                    p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                    li: ({node, ...props}) => <li className="text-gray-700 ml-4" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-gray-800" {...props} />,
                    code: ({node, inline, ...props}) => 
                      inline 
                        ? <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                        : <code className="block bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />,
                  }}
                >
                  {selectedNote?.content}
                </ReactMarkdown>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Created: {selectedNote && new Date(selectedNote.created_at).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Updated: {selectedNote && new Date(selectedNote.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
