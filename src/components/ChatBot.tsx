import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User as UserIcon } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { messages, isLoading, sendMessage } = useChat();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleAddToCart = (event: CustomEvent) => {
      const productSlug = event.detail;
      addToCart(productSlug);
    };

    window.addEventListener('add-to-cart' as any, handleAddToCart as any);

    return () => {
      window.removeEventListener('add-to-cart' as any, handleAddToCart as any);
    };
  }, [addToCart]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickActions = [
    "Show me featured products",
    "Help me find electronics",
    "What's in my cart?",
    "How do I track my order?",
    "Tell me about shipping"
  ];

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  const renderMessage = (message: { text: string; isUser: boolean }) => {
    if (message.isUser) {
      return <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>;
    }
    return (
      <div 
        className="whitespace-pre-wrap leading-relaxed"
        dangerouslySetInnerHTML={{ __html: message.text }} 
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === 'A' && target.classList.contains('view-details-btn')) {
            e.preventDefault();
            const href = target.getAttribute('href');
            if (href) {
              navigate(href);
            }
          }
        }}
      />
    );
  };

  return (
    <>
      {/* Chat Toggle Button - Fixed positioning */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 z-50 flex items-center justify-center ${
          isOpen
            ? 'bg-error-500 hover:bg-error-600 scale-95'
            : 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 hover:scale-110'
        } text-white hover:shadow-xl group`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <div className="relative">
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200" />
          ) : (
            <>
              <MessageCircle className="w-7 h-7 transition-transform duration-200 group-hover:scale-110" />
              {/* Notification dot for new messages */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full animate-pulse"></div>
            </>
          )}
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] h-[32rem] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-40 animate-slide-in overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-poppins font-semibold text-lg">Veloriya Assistant</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-sm opacity-90">
                    {user ? `Hi ${user.name}! I'm here to help` : 'Online now'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex items-start space-x-2 max-w-[85%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isUser 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gradient-to-r from-secondary-500 to-primary-500 text-white'
                  }`}>
                    {message.isUser ? (
                      <UserIcon className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-sm font-lato shadow-sm ${
                      message.isUser
                        ? 'bg-primary-500 text-white rounded-br-md'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {renderMessage(message)}
                    <p className={`text-xs mt-2 opacity-70 ${
                      message.isUser ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-secondary-500 to-primary-500 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-bl-md border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {messages.length === 1 && !isLoading && (
              <div className="space-y-2 animate-fade-in">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action)}
                      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <form onSubmit={handleSend} className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about Veloriya..."
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <MessageCircle className="w-4 h-4" />
                </div>
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            
            {/* Typing indicator */}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Powered by Gemini AI • Always here to help
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
