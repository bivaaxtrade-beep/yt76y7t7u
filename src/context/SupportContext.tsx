import React, { createContext, useContext, useState } from 'react';

const SupportContext = createContext<{ isOpen: boolean; setIsOpen: (isOpen: boolean) => void } | undefined>(undefined);

export const SupportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SupportContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SupportContext.Provider>
  );
};

export const useSupport = () => {
  const context = useContext(SupportContext);
  if (!context) throw new Error('useSupport must be used within a SupportProvider');
  return context;
};
