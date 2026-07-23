import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Bot,
  User,
  Headphones,
  Check,
  CheckCheck,
  Star,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  CreditCard,
  TrendingUp,
  HelpCircle,
  FileText,
  Clock,
  ThumbsUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import {
  sendAiSupportMessage,
  createOrUpdateTicket,
  fetchTicketMessages,
  sendSupportMessage,
  rateTicket,
  SupportMessage,
  SupportTicket,
} from '../services/supportService';

interface SupportChatWidgetProps {
  currentUser?: {
    uid: string;
    email: string;
    displayName?: string;
  } | null;
  isOpen?: boolean;
  onClose?: () => void;
}

const CATEGORIES = [
  { id: 'Deposit', label: 'Deposit Issues', icon: CreditCard, color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400' },
  { id: 'Withdrawal', label: 'Withdrawal Request', icon: CreditCard, color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400' },
  { id: 'Trading', label: 'Trading & Payouts', icon: TrendingUp, color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400' },
  { id: 'Verification (KYC)', label: 'KYC Verification', icon: ShieldCheck, color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400' },
  { id: 'Referral', label: 'Affiliate & Referral', icon: Sparkles, color: 'from-pink-500/20 to-pink-600/10 border-pink-500/30 text-pink-400' },
  { id: 'Technical Issue', label: 'Technical Issue', icon: HelpCircle, color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400' },
];

export const SupportChatWidget: React.FC<SupportChatWidgetProps> = ({
  currentUser,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalOpen;
  const handleClose = externalOnClose || (() => setInternalOpen(false));

  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Deposit');
  const [isTyping, setIsTyping] = useState(false);
  const [isHandoffTriggered, setIsHandoffTriggered] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const guestUserIdRef = useRef<string | null>(null);
  if (!guestUserIdRef.current) {
    guestUserIdRef.current = 'guest-' + Math.floor(Math.random() * 10000);
  }
  const userId = currentUser?.uid || guestUserIdRef.current;
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Trader';
  const userEmail = currentUser?.email || 'trader@bivox.com';

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Setup Socket.io connection for real-time chat
  useEffect(() => {
    if (!isOpen) return;

    const socket = io('/');
    socketRef.current = socket;

    socket.on('connect', () => {
      const token = localStorage.getItem('bivax_token');
      if (token) {
        socket.emit('authenticate', token);
      }
      if (activeTicket?.id) {
        socket.emit('join_ticket', activeTicket.id);
        // Fetch missing messages on reconnect
        fetchTicketMessages(activeTicket.id, false).then(fetched => {
          setMessages(fetched);
        }).catch(err => console.error(err));
      }
    });

    socket.on('support_message', (msg: SupportMessage) => {
      setMessages((prev) => {
        // Deduplicate
        if (prev.some((m) => m.id === msg.id)) return prev;
        
        // If message is from others and chat is open, mark as read
        if (msg.senderType !== 'user' && isOpen) {
          socket.emit('message_status', { ticketId: msg.ticketId, messageId: msg.id, status: 'seen' });
          msg.status = 'seen';
        }

        // Replace matching temp message if present
        const tempIndex = prev.findIndex(
          (m) => m.id.startsWith('temp-') && m.text === msg.text && m.senderType === msg.senderType
        );
        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = { ...msg, status: msg.status || 'delivered' };
          return updated;
        }
        return [...prev, { ...msg, status: msg.status || 'delivered' }];
      });
    });

    socket.on('message_status', ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status } : m))
      );
    });

    socket.on('ticket_updated', (updated: SupportTicket) => {
      if (activeTicket && updated.id === activeTicket.id) {
        setActiveTicket(updated);
        if (updated.status === 'in_progress' || updated.assignedAgentName) {
          setIsHandoffTriggered(true);
        }
      }
    });

    socket.on('typing', ({ senderType, isTyping: typingState }) => {
      if (senderType !== 'user') {
        setIsTyping(typingState);
      }
    });

    return () => {
      if (activeTicket?.id) {
        socket.emit('leave_ticket', activeTicket.id);
      }
      socket.disconnect();
    };
  }, [isOpen, activeTicket?.id]);

  // Load active ticket or messages on open
  useEffect(() => {
    if (isOpen && activeTicket?.id) {
      loadMessages(activeTicket.id);
      if (socketRef.current) {
        socketRef.current.emit('join_ticket', activeTicket.id);
      }
    }
  }, [isOpen, activeTicket?.id]);

  const loadMessages = async (ticketId: string) => {
    const fetched = await fetchTicketMessages(ticketId, false);
    const unread = fetched.filter(m => m.senderType !== 'user' && m.status !== 'seen');
    unread.forEach(m => {
      socketRef.current?.emit('message_status', { ticketId, messageId: m.id, status: 'seen' });
      m.status = 'seen';
    });
    setMessages(fetched);
  };

  const startNewChat = async (category: string) => {
    setSelectedCategory(category);
    setIsTyping(true);

    const ticketId = `TICK-${Date.now()}`;
    const newTicket = await createOrUpdateTicket({
      id: ticketId,
      userId,
      userName,
      userEmail,
      subject: `${category} Support Request`,
      category,
      message: `Initiated ${category} chat`,
      status: 'open',
      priority: 'medium',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    if (newTicket) {
      setActiveTicket(newTicket);
      if (socketRef.current) {
        socketRef.current.emit('join_ticket', newTicket.id);
      }

      // Welcome message from AI
      const welcomeMsg: SupportMessage = {
        id: `MSG-WELCOME-${Date.now()}`,
        ticketId: newTicket.id,
        userId: 'ai-bot',
        senderType: 'bot',
        senderName: 'Bivox AI Specialist',
        text: `Hello ${userName}! 👋 Welcome to Bivox Support. I am your 24/7 AI Trading Specialist. How can I assist you with your **${category}** request today?`,
        createdAt: Date.now(),
        status: 'delivered',
      };
      setMessages([welcomeMsg]);
      await sendSupportMessage({
        ticketId: newTicket.id,
        userId: 'ai-bot',
        text: welcomeMsg.text,
        senderType: 'bot',
        senderName: 'Bivox AI Specialist',
      });
    }
    setIsTyping(false);
  };

  const handleTyping = (text: string) => {
    setInputText(text);
    if (!activeTicket || !socketRef.current) return;
    
    socketRef.current.emit('typing', { ticketId: activeTicket.id, senderType: 'user', isTyping: true });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing', { ticketId: activeTicket.id, senderType: 'user', isTyping: false });
    }, 2000);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && attachedFiles.length === 0) return;

    const userText = inputText.trim();
    setInputText('');

    let ticket = activeTicket;
    if (!ticket) {
      const ticketId = `TICK-${Date.now()}`;
      ticket = await createOrUpdateTicket({
        id: ticketId,
        userId,
        userName,
        userEmail,
        subject: userText.substring(0, 40) || 'Support Chat',
        category: selectedCategory,
        message: userText,
        status: 'open',
        priority: 'medium',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      if (ticket) {
        setActiveTicket(ticket);
        if (socketRef.current) {
          socketRef.current.emit('join_ticket', ticket.id);
        }
      }
    }

    if (!ticket) return;

    // 1. Optimistic UI: Display instantly in chat window with status 'sending'
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMsg: SupportMessage = {
      id: tempId,
      ticketId: ticket.id,
      userId,
      senderType: 'user',
      senderName: userName,
      text: userText,
      attachments: attachedFiles,
      createdAt: Date.now(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setAttachedFiles([]);

    // 2. Send to server
    const confirmedMsg = await sendSupportMessage({
      ticketId: ticket.id,
      userId,
      text: userText,
      senderType: 'user',
      senderName: userName,
      attachments: optimisticMsg.attachments,
    });

    if (confirmedMsg) {
      // Synchronize confirmed message ID and status 'sent' / 'delivered'
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...confirmedMsg, status: 'delivered' } : m))
      );
    } else {
      // Mark as failed or keep retryable
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'sent' } : m))
      );
    }

    // Emit typing indicator stop
    if (socketRef.current) {
      socketRef.current.emit('typing', { ticketId: ticket.id, senderType: 'user', isTyping: false });
    }

    setIsTyping(true);

    // Get AI response unless already handed off to human
    if (!isHandoffTriggered && ticket.status !== 'in_progress') {
      const aiResponse = await sendAiSupportMessage({
        message: userText,
        category: selectedCategory,
        ticketId: ticket.id,
        userId,
        history: messages.map((m) => ({ sender: m.senderType, text: m.text })),
      });

      setIsTyping(false);

      if (aiResponse.reply) {
        const botMsg = await sendSupportMessage({
          ticketId: ticket.id,
          userId: 'ai-bot',
          text: aiResponse.reply,
          senderType: 'bot',
          senderName: 'Bivox AI Specialist',
        });
        if (botMsg) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === botMsg.id)) return prev;
            return [...prev, { ...botMsg, status: 'delivered' }];
          });
        }
      }

      if (aiResponse.requiresHandoff) {
        triggerHumanHandoff(ticket);
      }
    } else {
      setIsTyping(false);
    }
  };

  const triggerHumanHandoff = async (targetTicket?: SupportTicket) => {
    const ticket = targetTicket || activeTicket;
    if (!ticket) return;

    setIsHandoffTriggered(true);
    setIsTyping(true);

    // Update ticket priority and assign queue status
    await createOrUpdateTicket({
      id: ticket.id,
      status: 'open',
      priority: 'high',
      updatedAt: Date.now(),
    });

    const sysMsg = await sendSupportMessage({
      ticketId: ticket.id,
      userId: 'system',
      text: '🔔 Ticket transferred to Live Human Support Agent queue. Estimated wait time: < 2 minutes.',
      senderType: 'system',
      senderName: 'System',
    });

    if (sysMsg) setMessages((prev) => [...prev, sysMsg]);
    setIsTyping(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setAttachedFiles((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRatingSubmit = async () => {
    if (!activeTicket || rating === 0) return;
    await rateTicket(activeTicket.id, rating, ratingFeedback);
    setRatingSubmitted(true);
  };

  return (
    <>
      {/* Floating Launcher Button if managed internally */}
      {externalIsOpen === undefined && (
        <button
          onClick={() => setInternalOpen(!internalOpen)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black px-5 py-3.5 rounded-full font-black text-sm uppercase tracking-wider shadow-2xl shadow-yellow-500/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Headphones className="w-5 h-5" />
          <span>24/7 Support</span>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Chat Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[420px] h-[600px] max-h-[85vh] bg-[#0c0d12] border border-[#1e202d] rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans"
          >
            {/* WhatsApp-Style Dark Header */}
            <div className="bg-[#12141d] border-b border-[#1e202d] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/30 border border-yellow-500/40 flex items-center justify-center text-yellow-400 font-bold">
                    {isHandoffTriggered || activeTicket?.assignedAgentName ? (
                      <Headphones className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <Bot className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#12141d] rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white leading-none">
                      {activeTicket?.assignedAgentName || (isHandoffTriggered ? 'Support Agent Assigned' : 'Bivox Trading Assistant')}
                    </h3>
                    <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
                      24/7 LIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" /> Average response: &lt; 1 min
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeTicket && !isHandoffTriggered && (
                  <button
                    onClick={() => triggerHumanHandoff()}
                    className="text-[11px] font-bold bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-2.5 py-1 rounded-xl transition-all"
                    title="Connect to human agent"
                  >
                    Talk to Human
                  </button>
                )}
              </div>
            </div>

            {/* Chat Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gradient-to-b from-[#0c0d12] to-[#0a0b0f]">
              {!activeTicket && messages.length === 0 ? (
                /* Category Picker Landing Screen */
                <div className="space-y-4 py-2">
                  <div className="bg-[#12141e] border border-yellow-500/20 rounded-2xl p-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-white font-bold text-sm mb-1">How can we help you today?</h4>
                    <p className="text-gray-400 text-xs">
                      Select a category to start an instant 24/7 live AI chat or connect with our support agents.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => startNewChat(cat.id)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r ${cat.color} border transition-all hover:scale-[1.01] text-left group`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5" />
                            <span className="font-bold text-xs text-white">{cat.label}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-all" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Active Message Stream */
                <>
                  {messages.map((msg) => {
                    const isUser = msg.senderType === 'user' || msg.userId === userId;
                    const isSystem = msg.senderType === 'system';
                    const isBot = msg.senderType === 'bot';

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[11px] font-medium px-3 py-1 rounded-full text-center">
                            {msg.text}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className="w-7 h-7 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                            {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                          </div>
                        )}

                        <div className={`max-w-[82%] space-y-1`}>
                          <div className="flex items-center gap-1.5 px-1">
                            <span className="text-[10px] font-bold text-gray-400">
                              {isUser ? 'You' : msg.senderName || 'Support Agent'}
                            </span>
                            <span className="text-[9px] text-gray-500">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isUser
                                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-medium rounded-tr-none shadow-lg shadow-yellow-500/10'
                                : 'bg-[#161824] border border-[#222536] text-gray-200 rounded-tl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>

                            {/* Attachments */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {msg.attachments.map((att, idx) => (
                                  <img
                                    key={idx}
                                    src={att}
                                    alt="attachment"
                                    className="max-h-40 rounded-xl border border-white/20 object-cover"
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          {isUser && (
                            <div className="flex justify-end pr-1 items-center gap-1 text-xs text-gray-400">
                              <span className="text-[9px] uppercase tracking-wider">{msg.status || 'delivered'}</span>
                              {msg.status === 'sending' ? (
                                <Clock className="w-3 h-3 animate-spin text-yellow-400" title="Sending..." />
                              ) : msg.status === 'sent' ? (
                                <Check className="w-3.5 h-3.5 text-gray-400" title="Sent" />
                              ) : msg.status === 'seen' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-yellow-500" title="Seen" />
                              ) : (
                                <CheckCheck className="w-3.5 h-3.5 text-gray-400" title="Delivered" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-2 items-center text-gray-400 text-xs py-1">
                      <div className="w-7 h-7 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 animate-pulse" />
                      </div>
                      <span className="italic font-medium text-[11px] text-gray-400">
                        Support assistant is typing...
                      </span>
                    </div>
                  )}

                  {/* CSAT Satisfaction Widget if ticket resolved */}
                  {activeTicket?.status === 'resolved' && !ratingSubmitted && (
                    <div className="bg-[#141622] border border-yellow-500/30 rounded-2xl p-4 text-center space-y-2 mt-4">
                      <div className="flex items-center justify-center gap-1 text-yellow-400 font-bold text-xs">
                        <ThumbsUp className="w-4 h-4" /> Rate your support experience
                      </div>
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`p-1 text-2xl transition-transform hover:scale-125 ${
                              star <= rating ? 'text-yellow-400' : 'text-gray-600'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Optional feedback..."
                            value={ratingFeedback}
                            onChange={(e) => setRatingFeedback(e.target.value)}
                            className="w-full bg-[#0c0d12] border border-[#222536] rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-yellow-500"
                          />
                          <button
                            onClick={handleRatingSubmit}
                            className="w-full bg-yellow-500 text-black font-bold py-1.5 rounded-xl text-xs uppercase"
                          >
                            Submit Rating
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {ratingSubmitted && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center text-xs p-3 rounded-2xl font-bold">
                      Thank you for your feedback! ❤️
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input & Footer Controls */}
            {activeTicket && (
              <div className="bg-[#12141d] border-t border-[#1e202d] p-3">
                {/* Attached Files Preview */}
                {attachedFiles.length > 0 && (
                  <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
                    {attachedFiles.map((file, i) => (
                      <div key={i} className="relative group shrink-0">
                        <img src={file} alt="preview" className="w-12 h-12 rounded-xl object-cover border border-yellow-500/40" />
                        <button
                          onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all shrink-0"
                    title="Attach Screenshot / Document"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-[#090a0e] border border-[#1e202d] rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-yellow-500/60 transition-all"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() && attachedFiles.length === 0}
                    className="p-2.5 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold disabled:opacity-40 hover:scale-105 active:scale-95 transition-all shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
