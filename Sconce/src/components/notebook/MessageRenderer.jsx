import React from 'react';

/**
 * Renders chat message content - handles both plain text and structured content with citations
 */
export default function MessageRenderer({ content, onCitationClick, isUserMessage = false }) {
  // Handle plain text messages (user messages or simple AI responses)
  if (typeof content === 'string') {
    return <div className={isUserMessage ? 'whitespace-pre-wrap' : 'whitespace-pre-wrap'}>{content}</div>;
  }

  // Handle structured content with segments and citations
  if (content && typeof content === 'object') {
    const { segments, citations } = content;

    // If we have segments array, render with citation support
    if (Array.isArray(segments)) {
      return (
        <div className="space-y-2">
          {segments.map((segment, idx) => (
            <span key={idx}>
              {segment.text}
              {segment.citation_id && citations && (
                <button
                  onClick={() => {
                    const citation = citations.find(c => c.citation_id === segment.citation_id);
                    if (citation && onCitationClick) {
                      onCitationClick(citation);
                    }
                  }}
                  className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 rounded transition-colors cursor-pointer"
                  title="View source"
                >
                  {segment.citation_id}
                </button>
              )}
              {' '}
            </span>
          ))}
        </div>
      );
    }

    // Fallback: try to stringify the object
    try {
      return <div className="whitespace-pre-wrap">{JSON.stringify(content, null, 2)}</div>;
    } catch (e) {
      return <div className="text-red-500">Error rendering message</div>;
    }
  }

  // Ultimate fallback
  return <div className="text-gray-500">No content</div>;
}
