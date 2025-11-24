import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNotes } from '../../hooks/useNotes';
import { useSources } from '../../hooks/useSources';

export default function StudioSidebar({ notebookId, onCitationClick }) {
  const [loading, setLoading] = useState(false);
  const { notes, isLoading } = useNotes(notebookId);
  const { sources } = useSources(notebookId);
  
  const hasProcessedSource = sources?.some(source => source.processing_status === 'completed') || false;

  const handleGeneratePodcast = async () => {
    if (!notebookId || !hasProcessedSource) return;
    setLoading(true);
    try {
      // Placeholder for podcast generation
      console.log('Generate podcast for notebook:', notebookId);
    } catch (e) {
      console.error('Failed to generate podcast', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-50 border-l border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Studio</h2>
        
        {/* Audio Overview Card */}
        <div className="p-4 mb-4 border border-gray-200 rounded-lg bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Audio Overview</h3>
          </div>

          <div className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#111827">
                  <path d="M280-120v-123q-104-14-172-93T40-520h80q0 83 58.5 141.5T320-320h10q5 0 10-1 13 20 28 37.5t32 32.5q-10 3-19.5 4.5T360-243v123h-80Zm20-282q-43-8-71.5-40.5T200-520v-240q0-50 35-85t85-35q50 0 85 35t35 85v160H280v80q0 31 5 60.5t15 57.5Zm340 2q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm-40 280v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T640-320q83 0 141.5-58.5T840-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T680-520v-240q0-17-11.5-28.5T640-800q-17 0-28.5 11.5T600-760v240q0 17 11.5 28.5T640-480Zm0-160Z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Deep Dive conversation</h4>
                <p className="text-sm text-gray-600">Two hosts</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={handleGeneratePodcast}
                disabled={loading || !hasProcessedSource}
                className="flex-1 px-4 py-2 text-sm text-white bg-slate-900 hover:bg-slate-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate'}
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
              {notes.map(note => (
                <div key={note.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer bg-white">
                  <h4 className="font-medium text-gray-900 truncate">{note.title}</h4>
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
    </div>
  );
}
