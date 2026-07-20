import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Mail } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("Successfully subscribed!");
        setEmail('');
      } else {
        toast.error("Failed to subscribe. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h3 className="text-white font-bold text-lg">Subscribe to our newsletter</h3>
      <p className="text-gray-500 text-sm mb-2">Get the latest market insights delivered to your inbox.</p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 bg-[#1c1d22] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ffcf00]"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#ffcf00] text-[#1c1d22] font-bold px-6 py-3 rounded-xl hover:bg-[#e6bb00] transition-colors disabled:opacity-50"
        >
          {loading ? '...' : <Mail size={20} />}
        </button>
      </div>
    </form>
  );
}
