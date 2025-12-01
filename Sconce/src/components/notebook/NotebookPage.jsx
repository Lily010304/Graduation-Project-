import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import NotebookHeader from './NotebookHeader';
import SourcesSidebar from './SourcesSidebar';
import ChatArea from './ChatArea';
import StudioSidebar from './StudioSidebar';
import { useSources } from '../../hooks/useSources';
import { useNotebook } from '../../hooks/useNotebook';

// notebookId should be passed as prop (from route or parent)
export default function NotebookPage({ notebookId }) {
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isStudioVisible, setIsStudioVisible] = useState(true);
  const { notebook } = useNotebook(notebookId);
  const { sources } = useSources(notebookId);

  const hasSource = sources && sources.length > 0;
  const isSourceDocumentOpen = !!selectedCitation;

  const handleCitationClick = (citation) => {
    setSelectedCitation(citation);
  };

  const handleCitationClose = () => {
    setSelectedCitation(null);
  };

  // Dynamic width calculations - expand sources when viewing citation
  const sourcesWidth = isSourceDocumentOpen 
    ? (isStudioVisible ? 'w-[35%]' : 'w-[30%]') 
    : (isStudioVisible ? 'w-[25%]' : 'w-[30%]');
  const chatWidth = isSourceDocumentOpen 
    ? (isStudioVisible ? 'w-[35%]' : 'w-[70%]') 
    : (isStudioVisible ? 'w-[45%]' : 'w-[70%]');
  const studioWidth = 'w-[30%]';

  return (
    <div className="h-full bg-white flex flex-col">
      <NotebookHeader notebookId={notebookId} />

      <div className="flex-1 flex overflow-hidden">
        <div className={`${sourcesWidth} flex-shrink-0`}>
          <SourcesSidebar 
            notebookId={notebookId}
            hasSource={hasSource}
            selectedCitation={selectedCitation}
            onCitationClose={handleCitationClose}
            setSelectedCitation={setSelectedCitation}
          />
        </div>

        <div className={`${chatWidth} flex-shrink-0`}>
          <ChatArea 
            notebookId={notebookId}
            notebook={notebook}
            hasSource={hasSource}
            onCitationClick={handleCitationClick}
          />
        </div>

        {isStudioVisible && (
          <div className={`${studioWidth} flex-shrink-0`}>
            <StudioSidebar 
              notebookId={notebookId}
              onCitationClick={handleCitationClick}
              isVisible={isStudioVisible}
              onToggle={() => setIsStudioVisible(!isStudioVisible)}
            />
          </div>
        )}
        
        {!isStudioVisible && (
          <button
            onClick={() => setIsStudioVisible(true)}
            className="fixed right-4 top-24 p-2 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 transition-colors z-10"
            title="Show studio"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}
