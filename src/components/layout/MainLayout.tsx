
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout({ children, hideNavbar, hideFooter, bgClassName = 'bg-[#111216]', mainPadding = 'p-6' }: { children: React.ReactNode; hideNavbar?: boolean; hideFooter?: boolean; bgClassName?: string; mainPadding?: string }) {
  return (
    <div className={`min-h-screen ${bgClassName} flex flex-col`}>
      {!hideNavbar && <Navbar />}
      <main className={`flex-1 overflow-auto ${mainPadding}`}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
