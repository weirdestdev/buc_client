
import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  isScrolled?: boolean;
}

export default function Logo({ size = 'medium', isScrolled = false }: LogoProps) {
  // Increase all size values by 20%
  const sizeClasses = {
    small: 'w-10 h-10', // from w-8 h-8 to w-10 h-10 (25% increase, closest to 20%)
    medium: 'w-14 h-14', // from w-12 h-12 to w-14 h-14 (~17% increase, closest to 20%)
    large: 'w-24 h-24' // from w-20 h-20 to w-24 h-24 (20% increase)
  };

  return (
    <div className={`flex items-center justify-center rounded-full ${sizeClasses[size]} shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${isScrolled ? 'bg-black' : ''}`}>
      <img 
        src="/lovable-uploads/9a3a0646-e76e-46cd-94ff-90dde851ee15.png" 
        alt="Business Unit Club Logo" 
        className="w-full h-full object-cover"
      />
    </div>
  );
}
