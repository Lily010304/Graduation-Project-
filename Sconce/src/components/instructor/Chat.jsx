import { useState, useEffect, useRef } from 'react';
import { sendChatMessage, getChatHistory, subscribeToChatUpdates } from '../../lib/insightsLM';
import { Send, Book, Loader } from 'lucide-react';

/**
 * AI Chat Interface with RAG and Citations
 * Used by both Instructors and Students
 */
export default function Chat({ notebookId, userId, userRole = 'instructor' }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
    const unsubscribe = subscribeToChatUpdates(notebookId, handleNewMessage);
    return () => unsubscribe();
  }, [notebookId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const history = await getChatHistory(notebookId);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    setMessages((prev) => {
      // Avoid duplicates
      if (prev.some(m => m.id === message.id)) return prev;
      return [...prev, message];
    });
    setLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Optimistically add user message (will be replaced by real one from Supabase)
    const tempMessage = {
      id: `temp-${Date.now()}`,
      type: 'human',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      await sendChatMessage(notebookId, userMessage, userId);
      // Real-time subscription will handle adding AI response
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message: ' + error.message);
      setLoading(false);
      // Remove temp message
      setMessages((prev) => prev.filter(m => m.id !== tempMessage.id));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-[#58ACA9]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-[#0f5a56]/10">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-[#0f5a56]/10">
        <Book className="w-5 h-5 text-[#58ACA9]" />
        <div className="flex-1">
          <div className="font-semibold text-[#0f5a56]">AI Chat Assistant</div>
          <div className="text-xs text-[#0f5a56]/60">
            Ask questions about your uploaded resources
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Book className="w-12 h-12 mx-auto mb-3 text-[#58ACA9]/30" />
            <p className="text-sm text-[#0f5a56]/60">
              Start a conversation! Ask questions about the uploaded resources.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        {loading && (
          <div className="flex items-center gap-2 text-[#0f5a56]/60">
            <Loader className="w-4 h-4 animate-spin" />
            <span className="text-sm">AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-6 py-4 border-t border-[#0f5a56]/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-full border border-[#0f5a56]/20 focus:outline-none focus:border-[#58ACA9] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-6 py-3 bg-[#58ACA9] text-white rounded-full font-semibold hover:bg-[#034242] transition disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Message Bubble Component
 */
function MessageBubble({ message }) {
  const isAI = message.type === 'ai';
  
  // Parse AI response content
  let displayContent = message.content;
  let citations = [];

  if (isAI && typeof message.content === 'string') {
    try {
      const parsed = JSON.parse(message.content);
      if (parsed.output && Array.isArray(parsed.output)) {
        displayContent = parsed.output.map(item => item.text).join('\n\n');
        
        // Extract citations from first output item
        if (parsed.output[0]?.citations) {
          citations = parsed.output[0].citations;
        }
      }
    } catch (e) {
      // Keep as is if not JSON
    }
  }

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] ${isAI ? 'order-1' : 'order-2'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isAI
              ? 'bg-[#58ACA9]/10 text-[#0f5a56]'
              : 'bg-[#58ACA9] text-white'
          }`}
        >
          <div className="text-sm whitespace-pre-wrap">{displayContent}</div>
          
          {/* Citations */}
          {isAI && citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#0f5a56]/10">
              <div className="text-xs font-semibold mb-2 text-[#0f5a56]/70">
                📚 Sources:
              </div>
              <div className="flex flex-wrap gap-2">
                {citations.map((citation, idx) => (
                  <button
                    key={idx}
                    className="text-xs px-2 py-1 bg-white text-[#58ACA9] rounded-lg border border-[#58ACA9]/20 hover:bg-[#58ACA9]/5 transition"
                    onClick={() => alert(`View source ${citation.chunk_index}`)}
                  >
                    [{citation.chunk_index}]
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className={`text-xs text-[#0f5a56]/40 mt-1 ${isAI ? 'text-left' : 'text-right'}`}>
          {new Date(message.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}
