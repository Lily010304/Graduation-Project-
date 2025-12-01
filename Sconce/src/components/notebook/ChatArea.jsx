import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Trash2 } from 'lucide-react';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useSources } from '../../hooks/useSources';
import AddSourcesDialog from './AddSourcesDialog';
import MessageRenderer from './MessageRenderer';

export default function ChatArea({ notebookId, notebook, hasSource, onCitationClick }) {
  const [message, setMessage] = useState('');
  const [showAddSourcesDialog, setShowAddSourcesDialog] = useState(false);
  const { messages, sendMessage, isSending, deleteChatHistory, isDeletingChatHistory } = useChatMessages(notebookId);
  const { sources } = useSources(notebookId);
  const [pendingUserMessage, setPendingUserMessage] = useState(null);
  const [showAiLoading, setShowAiLoading] = useState(false);
  const [clickedQuestions, setClickedQuestions] = useState(new Set());
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const latestRef = useRef(null);
  const scrollAreaRef = useRef(null);

  const sourceCount = sources?.length || 0;
  const hasProcessedSource = sources?.some(s => s.processing_status === 'completed');
  const isChatDisabled = !hasProcessedSource;
  const isGenerating = notebook?.generation_status === 'generating';

  // Track message count to detect when AI response arrives
  const [lastMessageCount, setLastMessageCount] = useState(0);

  useEffect(() => {
    if (latestRef.current && scrollAreaRef.current) {
      setTimeout(() => {
        latestRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [pendingUserMessage, messages.length, showAiLoading]);

  // Clear pending states when new messages arrive
  useEffect(() => {
    if (messages.length > lastMessageCount && pendingUserMessage) {
      setPendingUserMessage(null);
      setShowAiLoading(false);
    }
    setLastMessageCount(messages.length);
  }, [messages.length, lastMessageCount, pendingUserMessage]);

  const handleSend = async (text) => {
    const content = text || message.trim();
    if (!content || !notebookId || isChatDisabled || isSendingMessage) return;
    
    // Prevent double-send
    setIsSendingMessage(true);
    
    // Show user message immediately
    setPendingUserMessage(content);
    
    try {
      console.log('Sending message:', content);
      await sendMessage({ notebookId, content });
      setMessage('');
      
      // Show AI loading after user message is sent
      setShowAiLoading(true);
    } catch (e) {
      console.error('sendMessage failed', e);
      setPendingUserMessage(null);
      setShowAiLoading(false);
    } finally {
      // Add a small delay before allowing another send
      setTimeout(() => setIsSendingMessage(false), 1000);
    }
  };

  const handleExampleQuestionClick = (question) => {
    setClickedQuestions(prev => new Set(prev).add(question));
    handleSend(question);
  };

  const isUserMessage = (msg) => {
    const type = msg.message?.type || msg.message?.role;
    return type === 'human' || type === 'user';
  };

  const getPlaceholderText = () => {
    if (isChatDisabled) {
      return sourceCount === 0 ? "Upload a source to get started..." : "Please wait while your sources are being processed...";
    }
    return "Start typing...";
  };

  // Get example questions from the notebook, filtering out clicked ones
  const exampleQuestions = notebook?.example_questions?.filter(q => !clickedQuestions.has(q)) || [];

  if (!hasSource) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Empty State - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-xl">
            {/* Upload Icon */}
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-gray-100">
              <Upload className="h-10 w-10 text-gray-400" />
            </div>
            
            {/* Main Message */}
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Add a source to get started</h2>
            
            {/* Upload Button */}
            <button
              onClick={() => setShowAddSourcesDialog(true)}
              className="inline-flex items-center px-6 py-3 bg-[#034242] text-white rounded-lg hover:bg-[#034242]/90 transition-colors shadow-sm font-medium"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload a source
            </button>
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className="border-t border-gray-200 bg-white flex-shrink-0">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex space-x-3 items-center">
              <div className="flex-1 relative">
                <input
                  placeholder="Upload a source to get started"
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 pr-24"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                  0 sources
                </div>
              </div>
              <button 
                disabled 
                className="p-3 bg-gray-200 rounded-lg cursor-not-allowed"
              >
                <Send className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="border-t border-gray-200 bg-white flex-shrink-0">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <p className="text-center text-sm text-gray-500">InsightsLM can be inaccurate; please double-check its responses.</p>
          </div>
        </div>

        <AddSourcesDialog 
          open={showAddSourcesDialog} 
          onOpenChange={setShowAddSourcesDialog} 
          notebookId={notebookId} 
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Chat</h2>
          {messages.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all chat messages?')) {
                  deleteChatHistory(notebookId);
                  setPendingUserMessage(null);
                  setShowAiLoading(false);
                }
              }}
              disabled={isDeletingChatHistory}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              <span>{isDeletingChatHistory ? 'Clearing...' : 'Clear Chat'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto" ref={scrollAreaRef}>
        <div className="p-8 border-b border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-10 h-10 flex items-center justify-center">
                {isGenerating ? (
                  <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                ) : (
                  <span className="text-[40px] leading-none">{notebook?.icon || '☕'}</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-medium text-gray-900">
                  {isGenerating ? 'Generating content...' : notebook?.title || 'Untitled notebook'}
                </h1>
                <p className="text-sm text-gray-600">{sourceCount} source{sourceCount !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              {isGenerating ? (
                <div className="flex items-center space-x-2 text-gray-600">
                  <p>AI is analyzing your source and generating a title and description...</p>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed">{notebook?.description || 'No description available for this notebook.'}</p>
              )}
            </div>

            {(messages.length > 0 || pendingUserMessage || showAiLoading) && (
              <div className="mb-6 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${isUserMessage(msg) ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${isUserMessage(msg) ? 'max-w-xs lg:max-w-md px-4 py-2 bg-blue-500 text-white rounded-lg' : 'w-full'}`}>
                      <div className={isUserMessage(msg) ? '' : 'text-gray-800'}>
                        <MessageRenderer 
                          content={msg.message.content} 
                          onCitationClick={onCitationClick}
                          isUserMessage={isUserMessage(msg)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {pendingUserMessage && !messages.some(m => isUserMessage(m) && m.message.content === pendingUserMessage) && (
                  <div className="flex justify-end">
                    <div className="max-w-xs lg:max-w-md px-4 py-2 bg-blue-500 text-white rounded-lg">
                      {pendingUserMessage}
                    </div>
                  </div>
                )}

                {showAiLoading && (
                  <div className="flex justify-start" ref={latestRef}>
                    <div className="flex items-center space-x-2 px-4 py-3 bg-gray-100 rounded-lg">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}

                {!showAiLoading && <div ref={latestRef} />}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                placeholder={getPlaceholderText()}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isChatDisabled && !isSending && !pendingUserMessage && !isSendingMessage && handleSend()}
                className="w-full pr-24 px-3 py-2 border border-gray-300 rounded-md"
                disabled={isChatDisabled || isSending || !!pendingUserMessage || isSendingMessage}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                {sourceCount} source{sourceCount !== 1 ? 's' : ''}
              </div>
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!message.trim() || isChatDisabled || isSending || !!pendingUserMessage || isSendingMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSending || pendingUserMessage || isSendingMessage ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Example Questions */}
          {!isChatDisabled && !pendingUserMessage && !showAiLoading && exampleQuestions.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <div className="flex space-x-2">
                {exampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleQuestionClick(question)}
                    className="flex-shrink-0 text-left whitespace-nowrap py-2 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <p className="text-center text-sm text-gray-500">InsightsLM can be inaccurate; please double-check its responses.</p>
      </div>

      <AddSourcesDialog 
        open={showAddSourcesDialog} 
        onOpenChange={setShowAddSourcesDialog} 
        notebookId={notebookId} 
      />
    </div>
  );
}
