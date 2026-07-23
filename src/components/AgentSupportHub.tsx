import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  MessageSquare,
  Search,
  Filter,
  User,
  Shield,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Send,
  Eye,
  EyeOff,
  Star,
  FileText,
  DollarSign,
  ChevronRight,
  Headphones,
  Zap,
  BarChart2,
  Users,
  Sparkles,
  RefreshCw,
  X,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  fetchSupportTickets,
  fetchTicketMessages,
  sendSupportMessage,
  updateTicketStatusAndAgent,
  fetchUserSupportContext,
  fetchCannedResponses,
  saveCannedResponse,
  fetchSupportAnalytics,
  SupportTicket,
  SupportMessage,
  UserSupportContext,
  CannedResponse,
  SupportAnalytics,
} from '../services/supportService';

interface AgentSupportHubProps {
  currentUser?: {
    uid: string;
    email: string;
    displayName?: string;
  } | null;
  userRole?: 'admin' | 'supervisor' | 'support_agent' | string;
}

export const AgentSupportHub: React.FC<AgentSupportHubProps> = ({
  currentUser,
  userRole = 'admin',
}) => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'analytics' | 'canned'>('workspace');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [userContext, setUserContext] = useState<UserSupportContext | null>(null);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [analytics, setAnalytics] = useState<SupportAnalytics | null>(null);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAgentOnline, setIsAgentOnline] = useState<boolean>(true);

  // Message Input States
  const [replyText, setReplyText] = useState<string>('');
  const [isInternalNote, setIsInternalNote] = useState<boolean>(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [showCannedMenu, setShowCannedMenu] = useState<boolean>(false);
  const [newCannedShortcut, setNewCannedShortcut] = useState('');
  const [newCannedTitle, setNewCannedTitle] = useState('');
  const [newCannedContent, setNewCannedContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const agentName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Support Agent';
  const agentId = currentUser?.uid || 'agent-1';
  const socketRef = useRef<Socket | null>(null);
  const selectedTicketRef = useRef<SupportTicket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    selectedTicketRef.current = selectedTicket;
  }, [selectedTicket]);

  const handleTyping = (text: string) => {
    setReplyText(text);
    if (!selectedTicket || !socketRef.current) return;
    
    socketRef.current.emit('typing', { ticketId: selectedTicket.id, senderType: 'agent', isTyping: true });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing', { ticketId: selectedTicket.id, senderType: 'agent', isTyping: false });
    }, 2000);
  };

  // Setup Socket.io connection for agent support hub
  useEffect(() => {
    const socket = io('/');
    socketRef.current = socket;

    socket.on('connect', () => {
      const token = localStorage.getItem('bivax_token');
      if (token) socket.emit('authenticate', token);
      if (selectedTicket?.id) {
        socket.emit('join_ticket', selectedTicket.id);
        fetchTicketMessages(selectedTicket.id, true).then(fetched => {
          setMessages(fetched);
        }).catch(err => console.error(err));
      }
    });

    socket.on('support_message', (msg: SupportMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        
        if (msg.senderType === 'user' && selectedTicketRef.current?.id === msg.ticketId) {
          socket.emit('message_status', { ticketId: msg.ticketId, messageId: msg.id, status: 'seen' });
          msg.status = 'seen';
        }
        
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
      setTickets((prev) => {
        const index = prev.findIndex((t) => t.id === updated.id);
        if (index !== -1) {
          const updatedList = [...prev];
          updatedList[index] = updated;
          return updatedList;
        }
        return [updated, ...prev];
      });
      if (selectedTicket && selectedTicket.id === updated.id) {
        setSelectedTicket(updated);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Load tickets on mount & periodically
  useEffect(() => {
    loadTickets();
    loadCanned();
    loadAnalytics();
  }, [statusFilter, categoryFilter, searchQuery]);

  // Load ticket details when selected
  useEffect(() => {
    if (selectedTicket?.id) {
      if (socketRef.current) {
        socketRef.current.emit('join_ticket', selectedTicket.id);
      }
      loadMessages(selectedTicket.id);
      if (selectedTicket.userId) {
        loadUserContext(selectedTicket.userId);
      }
    }
  }, [selectedTicket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadTickets = async () => {
    const fetched = await fetchSupportTickets({
      status: statusFilter,
      category: categoryFilter,
      search: searchQuery,
    });
    setTickets(fetched);
    setSelectedTicket(prev => prev || (fetched.length > 0 ? fetched[0] : null));
  };

  const loadMessages = async (ticketId: string) => {
    const fetched = await fetchTicketMessages(ticketId, true);
    const unread = fetched.filter(m => m.senderType === 'user' && m.status !== 'seen');
    unread.forEach(m => {
      socketRef.current?.emit('message_status', { ticketId, messageId: m.id, status: 'seen' });
      m.status = 'seen';
    });
    setMessages(fetched);
  };

  const loadUserContext = async (userId: string) => {
    const ctx = await fetchUserSupportContext(userId);
    setUserContext(ctx);
  };

  const loadCanned = async () => {
    const cr = await fetchCannedResponses();
    setCannedResponses(cr);
  };

  const loadAnalytics = async () => {
    const data = await fetchSupportAnalytics();
    setAnalytics(data);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedTicket || (!replyText.trim() && attachedFiles.length === 0)) return;

    const text = replyText.trim();
    setReplyText('');
    
    if (socketRef.current) {
      socketRef.current.emit('typing', { ticketId: selectedTicket.id, senderType: 'agent', isTyping: false });
    }

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMsg: SupportMessage = {
      id: tempId,
      ticketId: selectedTicket.id,
      userId: agentId,
      senderType: 'agent',
      senderName: agentName,
      text,
      attachments: attachedFiles,
      isInternalNote,
      createdAt: Date.now(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setAttachedFiles([]);
    setIsInternalNote(false);
    setShowCannedMenu(false);

    const confirmedMsg = await sendSupportMessage({
      ticketId: selectedTicket.id,
      userId: agentId,
      text,
      senderType: 'agent',
      senderName: agentName,
      attachments: optimisticMsg.attachments,
      isInternalNote,
    });

    if (confirmedMsg) {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...confirmedMsg, status: 'delivered' } : m))
      );
    } else {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'sent' } : m))
      );
    }

    // Refresh tickets list
    loadTickets();
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedTicket) return;
    const ok = await updateTicketStatusAndAgent(selectedTicket.id, { status });
    if (ok) {
      setSelectedTicket((prev) => (prev ? { ...prev, status: status as any } : null));
      loadTickets();
      loadMessages(selectedTicket.id);
    }
  };

  const handleAssignToMe = async () => {
    if (!selectedTicket) return;
    const ok = await updateTicketStatusAndAgent(selectedTicket.id, {
      assignedAgentId: agentId,
      assignedAgentName: agentName,
      assignedAgentEmail: currentUser?.email || 'agent@bivox.com',
      status: 'in_progress',
    });
    if (ok) {
      setSelectedTicket((prev) =>
        prev
          ? {
              ...prev,
              assignedAgentId: agentId,
              assignedAgentName: agentName,
              status: 'in_progress',
            }
          : null
      );
      loadTickets();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) setAttachedFiles((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const insertCannedResponse = (content: string) => {
    setReplyText((prev) => (prev ? `${prev}\n${content}` : content));
    setShowCannedMenu(false);
  };

  const handleCreateCanned = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCannedShortcut || !newCannedTitle || !newCannedContent) return;

    const ok = await saveCannedResponse({
      shortcut: newCannedShortcut.startsWith('/') ? newCannedShortcut : `/${newCannedShortcut}`,
      title: newCannedTitle,
      category: 'General',
      content: newCannedContent,
      createdBy: agentName,
    });

    if (ok) {
      setNewCannedShortcut('');
      setNewCannedTitle('');
      setNewCannedContent('');
      loadCanned();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Mode Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0a0a0f] border border-[#1e202d] p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/30 border border-yellow-500/40 flex items-center justify-center text-yellow-400 font-bold">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Support Operations Hub</h1>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                ENTERPRISE
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Real-time live chat queue, ticket routing, and 360° trader inspection.</p>
          </div>
        </div>

        {/* Controls & Nav */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Agent Online Switch */}
          <button
            onClick={() => setIsAgentOnline(!isAgentOnline)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
              isAgentOnline
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-gray-800/50 border-gray-700 text-gray-400'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isAgentOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}></span>
            {isAgentOnline ? 'Agent Status: ONLINE' : 'Agent Status: OFFLINE'}
          </button>

          {/* Sub Tab Switcher */}
          <div className="flex items-center bg-[#141622] p-1 rounded-2xl border border-[#1e202d]">
            <button
              onClick={() => setActiveTab('workspace')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'workspace' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              Chat Workspace
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'analytics' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('canned')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'canned' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              Canned Replies
            </button>
          </div>
        </div>
      </div>

      {/* 1. CHAT WORKSPACE MODE */}
      {activeTab === 'workspace' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[720px]">
          {/* PANE 1: TICKET QUEUE (xl:col-span-3) */}
          <div className="xl:col-span-3 bg-[#0a0a0f] border border-[#1e202d] rounded-3xl p-4 flex flex-col gap-4 max-h-[780px] overflow-hidden shadow-xl">
            {/* Search & Category Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search subject, email, ticket ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#12141e] border border-[#1e202d] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-yellow-500/60"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-1/2 bg-[#12141e] border border-[#1e202d] rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-gray-300 outline-none"
                >
                  <option value="all">Status: All</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_user">Waiting User</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-1/2 bg-[#12141e] border border-[#1e202d] rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-gray-300 outline-none"
                >
                  <option value="all">Category: All</option>
                  <option value="Deposit">Deposit</option>
                  <option value="Withdrawal">Withdrawal</option>
                  <option value="Trading">Trading</option>
                  <option value="Verification (KYC)">KYC</option>
                  <option value="Referral">Referral</option>
                  <option value="Technical Issue">Tech Issue</option>
                </select>
              </div>
            </div>

            {/* Queue Count */}
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 px-1 border-b border-[#1e202d] pb-2">
              <span>ACTIVE QUEUE ({tickets.length})</span>
              <button onClick={loadTickets} className="hover:text-yellow-400 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tickets Cards List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">No support tickets match query</div>
              ) : (
                tickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  const isHighPriority = t.priority === 'high' || t.priority === 'urgent';

                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all relative ${
                        isSelected
                          ? 'bg-yellow-500/10 border-yellow-500/50 shadow-lg shadow-yellow-500/5'
                          : 'bg-[#12141e]/60 border-[#1e202d] hover:bg-[#141622]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                          {t.id.substring(0, 10)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            t.status === 'open'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : t.status === 'in_progress'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : t.status === 'resolved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-gray-700/50 text-gray-400'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-white truncate mb-1">{t.subject}</h4>
                      <p className="text-[11px] text-gray-400 truncate mb-2">{t.lastMessage || t.message}</p>

                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-[#1e202d]">
                        <span className="font-medium text-gray-400 truncate">{t.userName || t.userEmail}</span>
                        <span className="shrink-0">{new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {isHighPriority && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* PANE 2: LIVE CHAT WORKSPACE (xl:col-span-6) */}
          <div className="xl:col-span-6 bg-[#0a0a0f] border border-[#1e202d] rounded-3xl flex flex-col max-h-[780px] overflow-hidden shadow-xl">
            {selectedTicket ? (
              <>
                {/* Chat Top Header */}
                <div className="bg-[#12141e] border-b border-[#1e202d] p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base text-white">{selectedTicket.subject}</h3>
                      <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded font-mono font-bold">
                        {selectedTicket.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {selectedTicket.userName} ({selectedTicket.userEmail}) • Ref: {selectedTicket.id}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Dropdown */}
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="bg-[#0c0d12] border border-[#1e202d] rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-yellow-500"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_user">Waiting User</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>

                    {/* Assigned Agent Button */}
                    {!selectedTicket.assignedAgentId ? (
                      <button
                        onClick={handleAssignToMe}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-md shadow-yellow-500/10"
                      >
                        Assign to Me
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl font-bold">
                        Agent: {selectedTicket.assignedAgentName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gradient-to-b from-[#0a0a0f] to-[#0c0e17]">
                  {messages.map((msg) => {
                    const isAgentMsg = msg.senderType === 'agent' || msg.isAdmin;
                    const isInternal = msg.isInternalNote;
                    const isSystem = msg.senderType === 'system';

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[11px] font-bold px-3 py-1 rounded-full">
                            {msg.text}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isAgentMsg ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isAgentMsg && (
                          <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/30 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                            <User className="w-4 h-4" />
                          </div>
                        )}

                        <div className="max-w-[82%] space-y-1">
                          <div className="flex items-center gap-2 px-1">
                            <span className="text-[11px] font-bold text-gray-300">
                              {msg.senderName || (isAgentMsg ? 'Support Agent' : 'Trader')}
                            </span>
                            {isInternal && (
                              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" /> INTERNAL NOTE
                              </span>
                            )}
                            <span className="text-[9px] text-gray-500">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isInternal
                                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
                                : isAgentMsg
                                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-medium rounded-tr-none shadow-md shadow-yellow-500/10'
                                : 'bg-[#141622] border border-[#222536] text-gray-200 rounded-tl-none'
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
                                    className="max-h-48 rounded-xl border border-white/20 object-cover cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => window.open(att, '_blank')}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Agent Response Box */}
                <div className="bg-[#12141e] border-t border-[#1e202d] p-3 space-y-2">
                  {/* Attached Files Bar */}
                  {attachedFiles.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
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

                  {/* Canned Responses Popover Menu */}
                  {showCannedMenu && (
                    <div className="bg-[#0c0d12] border border-[#222536] rounded-2xl p-2 max-h-48 overflow-y-auto space-y-1 custom-scrollbar shadow-2xl">
                      <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">
                        Quick Canned Replies
                      </div>
                      {cannedResponses.map((cr) => (
                        <button
                          key={cr.id}
                          onClick={() => insertCannedResponse(cr.content)}
                          className="w-full text-left p-2 rounded-xl hover:bg-yellow-500/10 hover:border-yellow-500/30 border border-transparent transition-all"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-yellow-400">{cr.shortcut}</span>
                            <span className="text-[10px] text-gray-500">{cr.category}</span>
                          </div>
                          <p className="text-[11px] text-gray-300 truncate">{cr.title}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Mode Selector & Quick Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsInternalNote(false)}
                        className={`text-xs font-bold px-3 py-1 rounded-xl transition-all ${
                          !isInternalNote ? 'bg-yellow-500 text-black' : 'bg-[#0c0d12] text-gray-400 hover:text-white'
                        }`}
                      >
                        Public Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsInternalNote(true)}
                        className={`text-xs font-bold px-3 py-1 rounded-xl transition-all flex items-center gap-1 ${
                          isInternalNote ? 'bg-amber-500 text-black' : 'bg-[#0c0d12] text-gray-400 hover:text-white'
                        }`}
                      >
                        <Lock className="w-3 h-3" /> Internal Note
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCannedMenu(!showCannedMenu)}
                      className="text-xs font-bold text-yellow-400 hover:underline flex items-center gap-1"
                    >
                      <Zap className="w-3.5 h-3.5" /> Quick Canned Replies
                    </button>
                  </div>

                  {/* Text Input Form */}
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
                      title="Attach File"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => handleTyping(e.target.value)}
                      placeholder={isInternalNote ? 'Write internal note (agents only)...' : 'Type reply to trader...'}
                      className={`flex-1 bg-[#090a0e] border rounded-2xl px-4 py-2.5 text-xs text-white outline-none transition-all ${
                        isInternalNote ? 'border-amber-500/50 focus:border-amber-500' : 'border-[#1e202d] focus:border-yellow-500/60'
                      }`}
                    />

                    <button
                      type="submit"
                      disabled={!replyText.trim() && attachedFiles.length === 0}
                      className={`p-2.5 rounded-2xl font-bold disabled:opacity-40 transition-all shrink-0 ${
                        isInternalNote ? 'bg-amber-500 text-black' : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-bold text-sm uppercase tracking-wider text-gray-400">Select a support ticket from queue</p>
              </div>
            )}
          </div>

          {/* PANE 3: USER 360° INSPECTION DRAWER (xl:col-span-3) */}
          <div className="xl:col-span-3 bg-[#0a0a0f] border border-[#1e202d] rounded-3xl p-4 flex flex-col gap-4 max-h-[780px] overflow-y-auto custom-scrollbar shadow-xl">
            {userContext ? (
              <>
                <div className="border-b border-[#1e202d] pb-3">
                  <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">TRADER 360° PROFILE</span>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/30 border border-yellow-500/40 text-yellow-400 font-black flex items-center justify-center text-sm">
                      {userContext.profile.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-sm text-white truncate">{userContext.profile.displayName}</h4>
                      <p className="text-[11px] text-gray-400 truncate">{userContext.profile.email}</p>
                    </div>
                  </div>
                </div>

                {/* Key Financial Badges */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#12141e] border border-[#1e202d] p-3 rounded-2xl">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">REAL BALANCE</span>
                    <p className="text-base font-black text-emerald-400 mt-0.5">
                      ${userContext.profile.realBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-[#12141e] border border-[#1e202d] p-3 rounded-2xl">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">DEMO BALANCE</span>
                    <p className="text-base font-black text-amber-400 mt-0.5">
                      ${userContext.profile.demoBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* KYC & Account Badges */}
                <div className="bg-[#12141e] border border-[#1e202d] p-3 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">KYC Verification:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        userContext.profile.kycStatus === 'verified'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : userContext.profile.kycStatus === 'pending'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {userContext.profile.kycStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Country:</span>
                    <span className="text-white font-bold">{userContext.profile.country || 'International'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Account Status:</span>
                    <span className="text-yellow-400 font-bold">{userContext.profile.status}</span>
                  </div>
                </div>

                {/* Recent Deposit Transactions */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RECENT DEPOSITS</span>
                  {userContext.deposits.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No deposits recorded</p>
                  ) : (
                    userContext.deposits.slice(0, 3).map((dep, idx) => (
                      <div key={idx} className="bg-[#12141e] border border-[#1e202d] p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                          <div>
                            <p className="font-bold text-white">${dep.amount}</p>
                            <p className="text-[9px] text-gray-500">{dep.method || 'Gateway'}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {dep.status || 'Success'}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Recent Withdrawal Requests */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RECENT WITHDRAWALS</span>
                  {userContext.withdrawals.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No withdrawals requested</p>
                  ) : (
                    userContext.withdrawals.slice(0, 3).map((w, idx) => (
                      <div key={idx} className="bg-[#12141e] border border-[#1e202d] p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="w-4 h-4 text-amber-400" />
                          <div>
                            <p className="font-bold text-white">${w.amount}</p>
                            <p className="text-[9px] text-gray-500">{w.method || 'Payout'}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-amber-400 uppercase bg-amber-500/10 px-1.5 py-0.5 rounded">
                          {w.status || 'Pending'}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Trade Metrics */}
                <div className="bg-[#12141e] border border-[#1e202d] p-3 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TRADING METRICS</span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Win Rate:</span>
                    <span className="text-emerald-400 font-bold">{userContext.trades.winRate}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Total Volume:</span>
                    <span className="text-white font-bold">${userContext.trades.totalVolume.toFixed(2)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <User className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-xs font-bold uppercase">No trader inspect loaded</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. PERFORMANCE ANALYTICS MODE */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0a0a0f] border border-[#1e202d] p-5 rounded-3xl">
              <span className="text-[11px] font-bold text-gray-400 uppercase">TOTAL TICKETS</span>
              <p className="text-3xl font-black text-white mt-1">{analytics?.totalTickets || 0}</p>
              <p className="text-[11px] text-emerald-400 mt-2 font-medium">
                Resolved: {analytics?.resolvedTickets || 0}
              </p>
            </div>

            <div className="bg-[#0a0a0f] border border-[#1e202d] p-5 rounded-3xl">
              <span className="text-[11px] font-bold text-gray-400 uppercase">AVG FIRST RESPONSE</span>
              <p className="text-3xl font-black text-yellow-400 mt-1">{analytics?.avgFirstResponseMinutes}m</p>
              <p className="text-[11px] text-gray-500 mt-2">Target SLA: &lt; 5 mins</p>
            </div>

            <div className="bg-[#0a0a0f] border border-[#1e202d] p-5 rounded-3xl">
              <span className="text-[11px] font-bold text-gray-400 uppercase">AVG RESOLUTION TIME</span>
              <p className="text-3xl font-black text-cyan-400 mt-1">{analytics?.avgResolutionHours}h</p>
              <p className="text-[11px] text-gray-500 mt-2">Target SLA: &lt; 2 hours</p>
            </div>

            <div className="bg-[#0a0a0f] border border-[#1e202d] p-5 rounded-3xl">
              <span className="text-[11px] font-bold text-gray-400 uppercase">CSAT SATISFACTION</span>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-3xl font-black text-emerald-400">{analytics?.csatAverage}</p>
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-[11px] text-emerald-400 mt-2 font-medium">98% Positive Feedback</p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-[#0a0a0f] border border-[#1e202d] p-6 rounded-3xl">
            <h3 className="font-black text-lg text-white mb-4 uppercase tracking-tight">Support Tickets by Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analytics?.categoryBreakdown || {}).map(([cat, count]) => (
                <div key={cat} className="bg-[#12141e] border border-[#1e202d] p-4 rounded-2xl flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{cat}</span>
                  <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-xl text-xs font-black">
                    {count} Tickets
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. CANNED RESPONSES MANAGER MODE */}
      {activeTab === 'canned' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Add New Canned Response Form */}
          <div className="xl:col-span-5 bg-[#0a0a0f] border border-[#1e202d] p-6 rounded-3xl space-y-4">
            <h3 className="font-black text-lg text-white uppercase tracking-tight">Create Canned Response</h3>
            <form onSubmit={handleCreateCanned} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Shortcut (e.g. /kyc)</label>
                <input
                  type="text"
                  placeholder="/shortcut"
                  value={newCannedShortcut}
                  onChange={(e) => setNewCannedShortcut(e.target.value)}
                  className="w-full bg-[#12141e] border border-[#1e202d] rounded-2xl px-4 py-2.5 text-xs text-white outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="KYC Document Request"
                  value={newCannedTitle}
                  onChange={(e) => setNewCannedTitle(e.target.value)}
                  className="w-full bg-[#12141e] border border-[#1e202d] rounded-2xl px-4 py-2.5 text-xs text-white outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Template Content</label>
                <textarea
                  rows={4}
                  placeholder="Template text message..."
                  value={newCannedContent}
                  onChange={(e) => setNewCannedContent(e.target.value)}
                  className="w-full bg-[#12141e] border border-[#1e202d] rounded-2xl p-4 text-xs text-white outline-none focus:border-yellow-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black py-3 rounded-2xl text-xs uppercase tracking-wider"
              >
                Save Quick Reply
              </button>
            </form>
          </div>

          {/* Existing Canned Responses List */}
          <div className="xl:col-span-7 bg-[#0a0a0f] border border-[#1e202d] p-6 rounded-3xl space-y-4">
            <h3 className="font-black text-lg text-white uppercase tracking-tight">Saved Canned Templates</h3>
            <div className="space-y-3">
              {cannedResponses.map((cr) => (
                <div key={cr.id} className="bg-[#12141e] border border-[#1e202d] p-4 rounded-2xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-yellow-400">{cr.shortcut}</span>
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-mono">
                      {cr.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white">{cr.title}</h4>
                  <p className="text-xs text-gray-300 leading-relaxed pt-1">{cr.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
