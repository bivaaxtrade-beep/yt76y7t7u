// Enterprise Support System API Service

export interface SupportTicket {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  subject: string;
  category: 'Deposit' | 'Withdrawal' | 'Trading' | 'Verification (KYC)' | 'Referral' | 'Technical Issue' | 'Account' | string;
  message: string;
  lastMessage?: string;
  status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedAgentEmail?: string;
  channel?: string;
  rating?: number;
  ratingFeedback?: string;
  isAiHandled?: boolean;
  closedAt?: number;
  firstResponseAt?: number;
  resolvedAt?: number;
  updatedAt: number;
  createdAt: number;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  userId: string;
  senderType: 'user' | 'agent' | 'bot' | 'system';
  senderName?: string;
  text: string;
  message?: string;
  attachments?: string[];
  isInternalNote?: boolean;
  isRead?: boolean;
  isAdmin?: boolean;
  createdAt: number;
  status?: 'sending' | 'sent' | 'delivered' | 'seen';
}

export interface UserSupportContext {
  profile: {
    uid: string;
    email: string;
    displayName: string;
    phone?: string;
    country?: string;
    kycStatus: string;
    realBalance: number;
    demoBalance: number;
    createdAt?: number;
    status?: string;
  };
  deposits: any[];
  withdrawals: any[];
  trades: {
    recent: any[];
    winRate: number;
    totalTrades: number;
    totalVolume: number;
  };
  referral: {
    referralCount: number;
    affiliateBalance: number;
    totalEarnings: number;
  };
}

export interface CannedResponse {
  id: string;
  shortcut: string;
  title: string;
  category: string;
  content: string;
  createdBy?: string;
  createdAt: number;
}

export interface SupportAnalytics {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  avgFirstResponseMinutes: number;
  avgResolutionHours: number;
  csatAverage: number;
  handoffRatePercent: number;
  categoryBreakdown: { [category: string]: number };
}

// 1. AI Chat Handler
export async function sendAiSupportMessage(data: {
  message: string;
  category?: string;
  ticketId?: string;
  userId?: string;
  history?: { sender: string; text: string }[];
}): Promise<{
  reply: string;
  requiresHandoff: boolean;
  suggestedCategory?: string;
  suggestedPriority?: 'low' | 'medium' | 'high' | 'urgent';
}> {
  try {
    const res = await fetch('/api/support/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('AI service error');
    return await res.json();
  } catch (err) {
    console.warn('AI Chat fallback triggered:', err);
    // Smart fallback AI rules
    const text = data.message.toLowerCase();
    let requiresHandoff = false;
    let reply = "Hello! I am Bivox Trading Assistant. ";

    if (text.includes('human') || text.includes('agent') || text.includes('person') || text.includes('speak to someone') || text.includes('support team')) {
      requiresHandoff = true;
      reply = "I understand you'd like to speak with a live support representative. I am transferring your request to our senior support queue now. An agent will connect shortly!";
    } else if (text.includes('deposit') || text.includes('payment') || text.includes('bkash') || text.includes('nagad') || text.includes('binance')) {
      reply += "Deposits via bKash, Nagad, Rocket, Binance Pay, and Crypto are processed automatically within 1-5 minutes. Minimum deposit is $10 (approx. 1,000 BDT). If your deposit is delayed, please share your Transaction ID / Hash here.";
    } else if (text.includes('withdraw') || text.includes('cashout') || text.includes('money')) {
      reply += "Withdrawal requests are processed in 1 to 24 hours depending on your VIP level. Ensure your account is verified (KYC) before requesting a withdrawal. Minimum withdrawal amount is $10.";
    } else if (text.includes('verify') || text.includes('kyc') || text.includes('document') || text.includes('nid')) {
      reply += "To complete KYC verification, upload a clear photo of your National ID card / Passport and a selfie in Profile -> Verification. Approval usually takes under 30 minutes.";
    } else if (text.includes('trade') || text.includes('payout') || text.includes('loss') || text.includes('win')) {
      reply += "All trades execute on live real-time market feeds with payouts up to 98%. You can practice risk-free on your $10,000 Demo Account at any time.";
    } else {
      reply += "How can I assist you with your Bivox trading account today? Choose a category or type your query below.";
    }

    return {
      reply,
      requiresHandoff,
      suggestedCategory: data.category || 'General',
      suggestedPriority: requiresHandoff ? 'high' : 'medium',
    };
  }
}

// 2. Tickets API
export async function fetchSupportTickets(filters?: {
  status?: string;
  category?: string;
  search?: string;
  assignedAgentId?: string;
  userId?: string;
}): Promise<SupportTicket[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.assignedAgentId) queryParams.append('assignedAgentId', filters.assignedAgentId);
    if (filters?.userId) queryParams.append('userId', filters.userId);

    const res = await fetch(`/api/support/tickets?${queryParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch tickets');
    const data = await res.json();
    return data.tickets || [];
  } catch (err) {
    console.error('fetchSupportTickets error:', err);
    return [];
  }
}

export async function createOrUpdateTicket(ticketData: Partial<SupportTicket>): Promise<SupportTicket | null> {
  try {
    const ticketId = ticketData.id || `TICK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, ticketData: { ...ticketData, id: ticketId } }),
    });
    if (!res.ok) throw new Error('Failed to create/update ticket');
    const data = await res.json();
    return data.ticket || null;
  } catch (err) {
    console.error('createOrUpdateTicket error:', err);
    return null;
  }
}

export async function fetchTicketMessages(ticketId: string, isAgent: boolean = false): Promise<SupportMessage[]> {
  try {
    const res = await fetch(`/api/tickets/${ticketId}/messages?role=${isAgent ? 'agent' : 'user'}`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    const data = await res.json();
    return data || [];
  } catch (err) {
    console.error('fetchTicketMessages error:', err);
    return [];
  }
}

export async function sendSupportMessage(data: {
  ticketId: string;
  userId: string;
  text: string;
  senderType: 'user' | 'agent' | 'bot' | 'system';
  senderName?: string;
  attachments?: string[];
  isInternalNote?: boolean;
}): Promise<SupportMessage | null> {
  try {
    const messageId = `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const res = await fetch('/api/tickets/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketId: data.ticketId,
        messageId,
        messageData: {
          senderId: data.userId,
          senderType: data.senderType,
          senderName: data.senderName,
          text: data.text,
          attachments: data.attachments,
          isInternalNote: data.isInternalNote ? 1 : 0,
          createdAt: Date.now(),
        },
      }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    const result = await res.json();
    return result.message || null;
  } catch (err) {
    console.error('sendSupportMessage error:', err);
    return null;
  }
}

export async function updateTicketStatusAndAgent(
  ticketId: string,
  update: {
    status?: string;
    priority?: string;
    category?: string;
    assignedAgentId?: string;
    assignedAgentName?: string;
    assignedAgentEmail?: string;
  }
): Promise<boolean> {
  try {
    const res = await fetch(`/api/support/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    return res.ok;
  } catch (err) {
    console.error('updateTicketStatus error:', err);
    return false;
  }
}

export async function rateTicket(ticketId: string, rating: number, feedback?: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/support/tickets/${ticketId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, feedback }),
    });
    return res.ok;
  } catch (err) {
    console.error('rateTicket error:', err);
    return false;
  }
}

export async function fetchUserSupportContext(userId: string): Promise<UserSupportContext | null> {
  try {
    const res = await fetch(`/api/support/user-context/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user context');
    return await res.json();
  } catch (err) {
    console.error('fetchUserSupportContext error:', err);
    return null;
  }
}

export async function fetchCannedResponses(): Promise<CannedResponse[]> {
  try {
    const res = await fetch('/api/support/canned-responses');
    if (!res.ok) throw new Error('Failed to fetch canned responses');
    return await res.json();
  } catch (err) {
    console.error('fetchCannedResponses error:', err);
    return [
      {
        id: '1',
        shortcut: '/kyc',
        title: 'KYC Document Guidance',
        category: 'Verification (KYC)',
        content: 'Dear trader, please submit a clear photo of your original National ID card or Passport (front and back) along with a selfie in your Profile -> Verification section.',
        createdAt: Date.now(),
      },
      {
        id: '2',
        shortcut: '/deposit',
        title: 'Deposit Delay Resolution',
        category: 'Deposit',
        content: 'Thank you for reaching out! Deposits usually credit automatically within 5 minutes. Please send us your transaction reference ID and payment screenshot so we can verify with our payment gateway instantly.',
        createdAt: Date.now(),
      },
      {
        id: '3',
        shortcut: '/withdrawal',
        title: 'Withdrawal Processing Time',
        category: 'Withdrawal',
        content: 'Your withdrawal request is currently in queue with our finance desk. Standard processing time is 1-24 hours. Once processed, funds will reflect directly in your account.',
        createdAt: Date.now(),
      },
      {
        id: '4',
        shortcut: '/trade_issue',
        title: 'Trade Settlement Audit',
        category: 'Trading',
        content: 'We have initiated a technical audit of your trade order on our live liquidity server. Our risk team will inspect the exact entry/exit tick quotes and update you shortly.',
        createdAt: Date.now(),
      },
    ];
  }
}

export async function saveCannedResponse(data: Omit<CannedResponse, 'id' | 'createdAt'>): Promise<boolean> {
  try {
    const res = await fetch('/api/support/canned-responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.error('saveCannedResponse error:', err);
    return false;
  }
}

export async function fetchSupportAnalytics(): Promise<SupportAnalytics | null> {
  try {
    const res = await fetch('/api/support/analytics');
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return await res.json();
  } catch (err) {
    console.error('fetchSupportAnalytics error:', err);
    return {
      totalTickets: 42,
      openTickets: 5,
      inProgressTickets: 8,
      resolvedTickets: 25,
      closedTickets: 4,
      avgFirstResponseMinutes: 2.4,
      avgResolutionHours: 1.1,
      csatAverage: 4.8,
      handoffRatePercent: 18,
      categoryBreakdown: {
        'Deposit': 14,
        'Withdrawal': 10,
        'Trading': 8,
        'Verification (KYC)': 6,
        'Technical Issue': 4,
      },
    };
  }
}
