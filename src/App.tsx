
// ---------- frontend/src/App.tsx ----------
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  showOptions?: boolean;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [context, setContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Prevent duplicate welcome
    if (!sessionStorage.getItem('welcome_sent')) {
      sessionStorage.setItem('welcome_sent', 'true');
      sendMessage('__WELCOME__', true);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (text: string, skipUserRender = false) => {
    if (!skipUserRender && text !== '__WELCOME__') {
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
      };
      setMessages(prev => [...prev, userMessage]);
    }
    setInputText('');

    try {
      const res = await fetch('http://localhost:8000/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: 'web-123',
          context: context || {},
        }),
      });
      const data = await res.json();

      const showOptions = /\(yes or no\)|\byes\b.*\bno\b|\bno\b.*\byes\b/i.test(data.response);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'bot',
        showOptions: showOptions,
      };
      setMessages(prev => [...prev, botMessage]);
      setContext(data.context || {});
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleSend = () => {
    if (inputText.trim()) sendMessage(inputText);
  };

  const handleOptionClick = (value: string) => {
    sendMessage(value);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-8">
      <div className="max-w-2xl w-full mx-4 bg-gray-100 rounded-2xl shadow-xl flex flex-col h-[800px]">
        <div className="px-6 py-4 text-xl font-bold bg-yellow-400 rounded-t-2xl">WOTC Chatbot</div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-sm text-white ${
                  msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <p>{msg.text}</p>
                {msg.showOptions && (
                  <div className="mt-2 flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`options-${msg.id}`}
                        onClick={() => handleOptionClick('yes')}
                        className="accent-blue-600"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`options-${msg.id}`}
                        onClick={() => handleOptionClick('no')}
                        className="accent-blue-600"
                      />
                      <span>No</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-300 bg-white">
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-3 pr-12 border rounded-full focus:outline-none"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your response..."
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-yellow-400 p-2 rounded-full hover:bg-yellow-500"
              onClick={handleSend}
            >
              <Send className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
