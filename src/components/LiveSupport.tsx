import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, X, Bot, Send, User } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const SHORTCUTS = [
  "Where to begin? 🧐",
  "Help with my payment",
  "DRT",
  "Submit a suggestion ✨",
  "Get a promocode 💰"
];

export const LiveSupport: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hello! How can I help you today?", sender: 'bot', timestamp: new Date() },
    { id: '2', text: "Feel free to select a topic or type in your request.", sender: 'bot', timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    const newUserMsg: Message = { id: Date.now().toString(), text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = { 
        id: (Date.now() + 1).toString(), 
        text: "Thanks for reaching out! A live support agent will join the chat shortly.", 
        sender: 'bot', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 sm:inset-4 md:inset-10 z-[500] bg-[#121316] rounded-2xl flex flex-col shadow-2xl border border-[#3b3b3f] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3b3b3f] bg-[#1e1e24]">
            <div className="flex items-center gap-3">
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white">
                    <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center">
                    <Bot size={20} className="text-[#121316]" />
                </div>
                <span className="font-bold text-white">Live Support</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white">
                <X size={20} />
            </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
                <div key={msg.id} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-[#3b3b3f] flex items-center justify-center text-white"><Bot size={16} /></div>}
                    <div className={`p-3 rounded-2xl max-w-[80%] ${msg.sender === 'user' ? 'bg-[#0091ff] text-white' : 'bg-[#2a2b30] text-gray-200'}`}>
                        {msg.text}
                    </div>
                    {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-[#3b3b3f] flex items-center justify-center text-white"><User size={16} /></div>}
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        {/* Shortcuts */}
        <div className="p-4 flex gap-2 overflow-x-auto border-t border-[#3b3b3f]">
            {SHORTCUTS.map(s => (
                <button 
                    key={s} 
                    onClick={() => handleSend(s)}
                    className="whitespace-nowrap px-4 py-2 border border-[#3b3b3f] rounded-full text-sm text-gray-300 hover:bg-[#3b3b3f] transition-colors"
                >
                    {s}
                </button>
            ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-[#1e1e24] border-t border-[#3b3b3f]">
            <div className="flex items-center gap-2 bg-[#2a2b30] rounded-full p-2">
                <input 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent px-4 py-2 text-white outline-none"
                />
                <button onClick={() => handleSend(inputValue)} className="p-2 bg-[#0091ff] text-white rounded-full">
                    <Send size={18} />
                </button>
            </div>
        </div>
    </div>
  );
};
