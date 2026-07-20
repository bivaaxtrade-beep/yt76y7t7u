import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';

const SEARCHABLE_PAGES = [
  { label: 'Trade', path: '/trade' },
  { label: 'Deposit', path: '/deposit' },
  { label: 'Profile', path: '/profile' },
  { label: 'Affiliate', path: '/affiliate' },
  { label: 'Support', path: '/page/contact' },
  { label: 'Legal Agreement', path: '/page/legal-agreement' },
  { label: 'Risk Disclosure', path: '/page/risk-disclosure' },
  { label: 'Privacy Policy', path: '/page/privacy-policy' },
  { label: 'Terms of Service', path: '/page/terms-of-service' },
  { label: 'AML Policy', path: '/page/aml-policy' },
  { label: 'Payment Methods', path: '/page/payment-methods' },
];

export default function Search() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const filteredPages = useMemo(() => {
    if (!query) return [];
    return SEARCHABLE_PAGES.filter(page =>
      page.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-[#1a1b1f] border border-[#2c2d32] rounded-full px-4 py-2 hover:border-gray-500 transition-colors">
        <SearchIcon size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-32 focus:w-48 transition-all"
        />
      </div>
      {isOpen && filteredPages.length > 0 && (
        <div className="absolute top-full mt-2 left-0 min-w-[200px] bg-[#1a1b1f] border border-[#2c2d32] rounded-xl shadow-lg z-50 overflow-hidden">
          {filteredPages.map((page) => (
            <button
              key={page.path}
              onClick={() => {
                navigate(page.path);
                setQuery('');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2c2d32] transition-colors"
            >
              {page.label}
            </button>
          ))}
        </div>
      )}
      {isOpen && query && filteredPages.length === 0 && (
          <div className="absolute top-full mt-2 left-0 min-w-[200px] bg-[#1a1b1f] border border-[#2c2d32] rounded-xl shadow-lg z-50 overflow-hidden px-4 py-2 text-sm text-gray-500">
            No results found.
          </div>
      )}
    </div>
  );
}
