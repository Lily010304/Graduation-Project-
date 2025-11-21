import React, { useState, useRef, useEffect } from 'react';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useSources } from '../../hooks/useSources';

export default function ChatArea({ notebookId }) {
  const [message, setMessage] = useState('');
  const { messages, sendMessage, isSending } = useChatMessages(notebookId);
  const { sources } = useSources(notebookId);
  const [pendingUserMessage, setPendingUserMessage] = useState(null);
  const latestRef = useRef(null);

  const hasProcessedSource = sources?.some(s => s.processing_status === 'completed');
  const isChatDisabled = !hasProcessedSource;

  useEffect(() => {
    if (latestRef.current) latestRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, pendingUserMessage]);

  const handleSend = async (text) => {
    const content = text || message.trim();
    if (!content || !notebookId || isChatDisabled) return;
    setPendingUserMessage(content);
    try {
      await sendMessage({ notebookId, content });
      setMessage('');
    } catch (e) {
      console.error('sendMessage failed', e);
    } finally {
      setPendingUserMessage(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-medium">Chat</h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map(m => (
            <div key={m.id} className={m.message.type === 'human' ? 'text-right' : 'text-left'}>
              <div className={`inline-block px-4 py-2 rounded ${m.message.type === 'human' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                {typeof m.message.content === 'string' ? m.message.content : JSON.stringify(m.message.content)}
              </div>
            </div>
          ))}

          {pendingUserMessage && (
            <div className="text-right">
              <div className="inline-block px-4 py-2 rounded bg-blue-500 text-white">{pendingUserMessage}</div>
            </div>
          )}

          <div ref={latestRef} />
        </div>
      </div>

      <div className="p-4 border-t">
        <div className="max-w-3xl mx-auto flex space-x-3">
          <input value={message} onChange={e => setMessage(e.target.value)} disabled={isChatDisabled} placeholder={isChatDisabled ? 'Upload and process a source to enable chat' : 'Ask a question...'} className="flex-1 border rounded px-3 py-2" onKeyDown={e => e.key === 'Enter' && handleSend()} />
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => handleSend()} disabled={isSending || isChatDisabled}>Send</button>
        </div>
      </div>
    </div>
  );
}
