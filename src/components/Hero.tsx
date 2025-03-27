
import React, { useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
  }, []);
  
  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/lovable-uploads/425bc0e0-f126-4d67-aa7b-908d6c2a8bfd.png" 
          alt="La Seu Cathedral Mallorca" 
          className="w-full h-full object-cover filter grayscale"
        />
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70 z-10"></div>
      
      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 h-full flex flex-col items-center justify-center text-white">
        <div className={`transition-all duration-2000 ${isLoaded ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
          <div className="overflow-hidden mb-4">
            <span className="block font-light text-sm md:text-base tracking-widest uppercase animate-slide-in-bottom" style={{ animationDelay: '300ms' }}>
              Local &amp; Discreet Business Circle
            </span>
          </div>
          
          <div className="overflow-hidden pb-4">
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-center clip-text animate-slide-in-bottom leading-tight md:leading-snug" style={{ animationDelay: '500ms' }}>
              The Island's private
              <br />
              showcase for investment and leisure
            </h1>
          </div>
          
          <div className="overflow-hidden mt-8">
            <p className="max-w-xl mx-auto text-center text-white/80 animate-slide-in-bottom" style={{ animationDelay: '700ms' }}>
              From Mallorquín real estate enthusiasts to investors who are enthusiastic about Mallorca
            </p>
          </div>
        </div>
        
        <a 
          href="#portfolio" 
          className="absolute bottom-12 animate-float"
          aria-label="Scroll down"
        >
          <ArrowDown className="w-10 h-10 text-white/70 hover:text-white transition-colors" />
        </a>
      </div>
    </section>
  );
}
