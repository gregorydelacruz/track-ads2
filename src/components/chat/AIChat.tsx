import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { getChatCompletion } from '../../lib/openai';

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hi, I'm your sobriety companion. I'm here to support you on your journey, provide encouragement, and help you stay on track. How are you feeling today?",
  timestamp: new Date()
};

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getChatCompletion(
        messages.concat(userMessage).map(({ role, content }) => ({ role, content }))
      );

      const responseMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-gradient-to-r from-purple-50/95 via-pink-50/95 to-indigo-50/95 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-lg shadow-lg border border-purple-100/30 dark:border-gray-700">
      <div className="flex items-center gap-2 p-4 border-b border-purple-100/30 dark:border-gray-700">
        <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        <div>
          <h2 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
            Sobriety Companion
          </h2>
          <p className="text-sm text-purple-600/80 dark:text-purple-300/80">
            Here to support your journey
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white ml-4'
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-purple-100/30 dark:border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 resize-none rounded-lg bg-white dark:bg-gray-700 border border-purple-100 dark:border-gray-600 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-800 dark:text-gray-200"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}