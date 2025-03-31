
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Minus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  showOptions?: boolean;
}

// Typewriter hook
function useTypewriter(text: string, speed: number = 50) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, current + 1));
      current++;
      if (current === text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayedText;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [context, setContext] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [welcomeShown, setWelcomeShown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fullTitle = 'Automate WOTC Prescreening with AI Assistance';
  const typedTitle = useTypewriter(fullTitle, 40);
  const titleDone = typedTitle.length === fullTitle.length;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (showChat && !welcomeShown) {
      sendMessage('__WELCOME__', true);
      setWelcomeShown(true);
    }
  }, [showChat, welcomeShown]);

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
    setIsTyping(true);

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
      const showOptions = /(yes or no)|\byes\b.*\bno\b|\bno\b.*\byes\b/i.test(data.response);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'bot',
        showOptions,
      };

      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setContext(data.context || {});
        setIsTyping(false);
      }, 700);
    } catch (err) {
      console.error('Error sending message:', err);
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (inputText.trim()) sendMessage(inputText);
  };

  const handleOptionClick = (value: string) => {
    sendMessage(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d7ebf6] via-[#c5e0f3] to-[#e7f0fb] font-sans">
    
      {/* Navbar */}
      
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="flex items-center space-x-3">
          <img src="https://img.icons8.com/color/48/bot.png" alt="Logo" className="h-8 w-8" />
          <span className="text-xl font-bold text-gray-800">FMS AI</span>
        </div>
        <div className="text-sm text-gray-500">Helping you maximize WOTC credits</div>
      </div>

      {/* Hero Section */}
      <div className="mt-40 mb-20 max-w-4xl ml-[10%] pr-4">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold text-gray-800 mb-4 leading-tight min-h-[4rem]"
        >
          {typedTitle}
        </motion.h1>

  {titleDone && (
    <>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-gray-600 text-lg max-w-2xl"
      >
        Save time and capture tax credits effortlessly using our pre-screening assistant tailored for your business.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        onClick={() => setShowChat(true)}
        className="mt-6 px-6 py-3 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white rounded-full font-medium shadow-lg hover:scale-105 transition"
      >
        Launch Chatbot
      </motion.button>
    </>
  )}
</div>

      {/* Bot icon */}
      {!showChat && (
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg animate-bounce z-50"
        >
          <Bot className="w-6 h-6" />
        </motion.button>
      )}

      {/* Chat Window */}
      {showChat && (
        <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed bottom-6 right-6 w-full max-w-sm h-[550px] rounded-[30px] bg-white shadow-xl flex flex-col border overflow-hidden z-40"
      >
          {/* Chat header */}
          <div className="relative px-5 py-4 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-t-[30px] flex items-center justify-between">
            <div className="flex items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-1 rounded-full shadow-md mr-3"
              >
                <img
                  src="https://img.icons8.com/color/48/bot.png"
                  alt="bot"
                  className="w-8 h-8 object-cover"
                />
              </motion.div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">WOTC Chat Assistant</h2>
                <p className="text-xs text-gray-500">You're chatting with the bot</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setShowChat(false)} className="text-gray-700 hover:text-gray-900">
                <Minus className="w-4 h-4" />
              </button>
              <button onClick={() => window.location.reload()} className="text-gray-700 hover:text-gray-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat body */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 chat-scroll bg-white">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.sender === 'user' ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <img
                      src="https://img.icons8.com/color/48/bot.png"
                      alt="bot"
                      className="w-8 h-8 rounded-full object-cover mr-2"
                    />
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm shadow-md max-w-[80%] whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-green-100 text-gray-900 rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                    {msg.showOptions && (
                      <div className="mt-3 flex space-x-3">
                        <button
                          className="px-4 py-1 rounded-full bg-green-500 text-white text-sm hover:bg-green-600"
                          onClick={() => handleOptionClick('yes')}
                        >
                          Yes
                        </button>
                        <button
                          className="px-4 py-1 rounded-full bg-gray-200 text-gray-700 text-sm hover:bg-gray-300"
                          onClick={() => handleOptionClick('no')}
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                  {msg.sender === 'user' && (
                    <img
                      src="https://img.icons8.com/color/48/user-male-circle--v1.png"
                      alt="user"
                      className="w-8 h-8 rounded-full object-cover ml-2"
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-2"
              >
                <span className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl text-sm text-gray-600">
                  <span className="animate-pulse">...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="px-4 py-3 border-t bg-white"
          >
            <div className="relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="w-full rounded-full border px-4 py-3 pr-12 text-sm shadow-sm focus:outline-none"
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-500 p-2 rounded-full hover:bg-green-600"
                onClick={handleSend}
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default App;