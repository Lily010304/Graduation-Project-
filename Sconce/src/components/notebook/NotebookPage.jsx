import React from 'react';
import NotebookHeader from './NotebookHeader';
import SourcesSidebar from './SourcesSidebar';
import ChatArea from './ChatArea';
import StudioSidebar from './StudioSidebar';

// notebookId should be passed as prop (from route or parent)
export default function NotebookPage({ notebookId }) {
  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <NotebookHeader notebookId={notebookId} />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/4 flex-shrink-0 border-r">
          <SourcesSidebar notebookId={notebookId} />
        </div>

        <div className="w-1/2 flex-shrink-0 border-r">
          <ChatArea notebookId={notebookId} />
        </div>

        <div className="w-1/4 flex-shrink-0">
          <StudioSidebar notebookId={notebookId} />
        </div>
      </div>
    </div>
  );
}
