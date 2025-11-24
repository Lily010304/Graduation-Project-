import React, { useState } from 'react';
import NotebookHeader from './NotebookHeader';
import SourcesSidebar from './SourcesSidebar';
import ChatArea from './ChatArea';
import StudioSidebar from './StudioSidebar';
import { useSources } from '../../hooks/useSources';

// notebookId should be passed as prop (from route or parent)
export default function NotebookPage({ notebookId }) {
  const [selectedCitation, setSelectedCitation] = useState(null);
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
  const sourcesWidth = isSourceDocumentOpen ? 'w-[35%]' : 'w-[25%]';
  const chatWidth = isSourceDocumentOpen ? 'w-[35%]' : 'w-[45%]';
  const studioWidth = 'w-[30%]';

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden">
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
            hasSource={hasSource}
            onCitationClick={handleCitationClick}
          />
        </div>

        <div className={`${studioWidth} flex-shrink-0`}>
          <StudioSidebar 
            notebookId={notebookId}
            onCitationClick={handleCitationClick}
          />
        </div>
      </div>
    </div>
  );
}
