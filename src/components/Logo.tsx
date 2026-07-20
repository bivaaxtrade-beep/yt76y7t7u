import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  withBackground?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 24, withBackground = false }) => {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-lg ${className}`} style={{ width: size, height: size }}>
      <img 
        src="https://i.postimg.cc/yYSDXHm2/IMG-20260421-WA0036(2).jpg" 
        alt="Bivaax Trade Logo" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
       loading="lazy" />
    </div>
  );
};
