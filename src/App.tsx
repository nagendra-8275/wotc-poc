


// // App.tsx
// import React, { useState, useRef, useEffect } from 'react';
// import { Send, Bot } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import './App.css';

// interface Message {
//   id: string;
//   text: string;
//   sender: 'user' | 'bot';
//   showOptions?: boolean;
// }

// function App() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputText, setInputText] = useState('');
//   const [context, setContext] = useState<any>(null);
//   const [showChat, setShowChat] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     if (showChat) {
//       sendMessage('__WELCOME__', true);
//     }
//   }, [showChat]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const sendMessage = async (text: string, skipUserRender = false) => {
//     if (!skipUserRender && text !== '__WELCOME__') {
//       const userMessage: Message = {
//         id: Date.now().toString(),
//         text,
//         sender: 'user',
//       };
//       setMessages(prev => [...prev, userMessage]);
//     }
//     setInputText('');
//     setIsTyping(true);

//     try {
//       const res = await fetch('http://localhost:8000/webhook', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           message: text,
//           session_id: 'web-123',
//           context: context || {},
//         }),
//       });
//       const data = await res.json();

//       const showOptions = /\(yes or no\)|\byes\b.*\bno\b|\bno\b.*\byes\b/i.test(data.response);

//       const botMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         text: data.response,
//         sender: 'bot',
//         showOptions,
//       };

//       setTimeout(() => {
//         setMessages(prev => [...prev, botMessage]);
//         setContext(data.context || {});
//         setIsTyping(false);
//       }, 700);
//     } catch (err) {
//       console.error('Error sending message:', err);
//       setIsTyping(false);
//     }
//   };

//   const handleSend = () => {
//     if (inputText.trim()) sendMessage(inputText);
//   };

//   const handleOptionClick = (value: string) => {
//     sendMessage(value);
//   };

//   return (
//     <div className="min-h-screen bg-[#f2f3f5] relative">
//       <div className="text-center py-20 px-4 max-w-3xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-800 mb-2">
//           FMS Integration (WOTC Prescreening)
//         </h1>
//         <p className="text-gray-600 text-sm mb-4">
//           Automate your hiring process with seamless integration of WOTC eligibility checks.
//         </p>
//         <p className="text-gray-600 text-sm">
//           Enable tax credits and boost compliance with real-time candidate screening powered by AI.
//         </p>
//       </div>

//       {!showChat && (
//         <motion.button
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.5 }}
//           onClick={() => setShowChat(true)}
//           className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg animate-bounce z-50"
//         >
//           <Bot className="w-6 h-6" />
//         </motion.button>
//       )}

//       {showChat && (
//         <motion.div
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="fixed bottom-6 right-6 w-full max-w-md h-[700px] rounded-[30px] bg-white shadow-xl flex flex-col border overflow-hidden"
//         >
//           <div className="relative px-5 py-4 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-t-[30px] flex items-center">
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.3 }}
//               className="bg-white p-1 rounded-full shadow-md mr-3"
//             >
//               <img
//                 src="https://img.icons8.com/color/48/bot.png"
//                 alt="bot"
//                 className="w-8 h-8 object-cover"
//               />
//             </motion.div>
//             <div>
//               <h2 className="text-lg font-semibold text-white">WOTC Chat Assistant</h2>
//               <p className="text-xs text-green-100">You're chatting with the bot</p>
//             </div>
//           </div>

//           <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 chat-scroll">
//             <AnimatePresence>
//               {messages.map((msg) => (
//                 <motion.div
//                   key={msg.id}
//                   initial={{ opacity: 0, x: msg.sender === 'user' ? 50 : -50 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 0 }}
//                   transition={{ duration: 0.2 }}
//                   className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//                 >
//                   {msg.sender === 'bot' && (
//                     <img
//                       src="https://img.icons8.com/color/48/bot.png"
//                       alt="bot"
//                       className="w-8 h-8 rounded-full object-cover mr-2"
//                     />
//                   )}
//                   <div
//                     className={`rounded-2xl px-4 py-3 text-sm shadow-md max-w-[80%] whitespace-pre-line ${
//                       msg.sender === 'user'
//                         ? 'bg-green-100 text-gray-900 rounded-br-none'
//                         : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
//                     }`}
//                   >
//                     {msg.text}
//                     {msg.showOptions && (
//                       <div className="mt-3 flex space-x-3">
//                         <button
//                           className="px-4 py-1 rounded-full bg-green-500 text-white text-sm hover:bg-green-600"
//                           onClick={() => handleOptionClick('yes')}
//                         >
//                           Yes
//                         </button>
//                         <button
//                           className="px-4 py-1 rounded-full bg-gray-200 text-gray-700 text-sm hover:bg-gray-300"
//                           onClick={() => handleOptionClick('no')}
//                         >
//                           No
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                   {msg.sender === 'user' && (
//                     <img
//                       src="https://img.icons8.com/color/48/user-male-circle--v1.png"
//                       alt="user"
//                       className="w-8 h-8 rounded-full object-cover ml-2"
//                     />
//                   )}
//                 </motion.div>
//               ))}
//             </AnimatePresence>

//             {isTyping && (
//               <motion.div
//                 key="typing"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="flex items-center space-x-2"
//               >
//                 <span className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />
//                 <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl text-sm text-gray-600">
//                   <span className="animate-pulse">...</span>
//                 </div>
//               </motion.div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           <div className="px-4 py-3 border-t bg-white">
//             <div className="relative">
//               <input
//                 type="text"
//                 value={inputText}
//                 onChange={(e) => setInputText(e.target.value)}
//                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//                 placeholder="Type a message..."
//                 className="w-full rounded-full border px-4 py-3 pr-12 text-sm shadow-sm focus:outline-none"
//               />
//               <button
//                 className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-500 p-2 rounded-full hover:bg-green-600"
//                 onClick={handleSend}
//               >
//                 <Send className="w-5 h-5 text-white" />
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </div>
//   );
// }

// export default App;

// App.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

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
  const [showChat, setShowChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [welcomeShown, setWelcomeShown] = useState(false);

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

      const showOptions = /\(yes or no\)|\byes\b.*\bno\b|\bno\b.*\byes\b/i.test(data.response);

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
    <div className="min-h-screen bg-[#f2f3f5] relative">
      <div className="text-center py-20 px-4 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">FMS Integration (WOTC Prescreening)</h1>
        <p className="text-gray-600 text-sm mb-4">
          Automate your hiring process with seamless integration of WOTC eligibility checks.
        </p>
        <p className="text-gray-600 text-sm">
          Enable tax credits and boost compliance with real-time candidate screening powered by AI.
        </p>
      </div>

      {!showChat && (
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg animate-bounce z-50"
        >
          <Bot className="w-6 h-6" />
        </motion.button>
      )}

      {showChat && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed bottom-6 right-6 w-full max-w-md h-[700px] rounded-[30px] bg-white shadow-xl flex flex-col border overflow-hidden"
        >
          <div className="relative px-5 py-4 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-t-[30px] flex items-center">
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
              <h2 className="text-lg font-semibold text-white">WOTC Chat Assistant</h2>
              <p className="text-xs text-green-100">You're chatting with the bot</p>
            </div>
          </div>

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

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
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