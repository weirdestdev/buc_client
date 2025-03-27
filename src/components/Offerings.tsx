
import React, { useState } from 'react';
import { Briefcase, Ship, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Offering = {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  backgroundImage: string;
};

const offerings: Offering[] = [
  {
    id: 1,
    title: "Business Transfers",
    icon: <Briefcase className="w-12 h-12" />,
    description: "Exclusive business acquisition opportunities and commercial real estate transfers across Mallorca.",
    backgroundImage: "/lovable-uploads/4475f1ad-512a-499a-83d7-50786b43dd4f.png"
  },
  {
    id: 2,
    title: "Yachts",
    icon: <Ship className="w-12 h-12" />,
    description: "Premium yacht sales, charters, and berth acquisitions in Mallorca's most prestigious marinas.",
    backgroundImage: "/lovable-uploads/27bb00d7-c66d-4ce0-96c2-d2c29d6e4c4f.png"
  },
  {
    id: 3,
    title: "Cars",
    icon: <Car className="w-12 h-12" />,
    description: "Luxury and classic vehicle acquisition services for discerning collectors and enthusiasts.",
    backgroundImage: "/lovable-uploads/ea554205-9bb7-427e-9387-90d2dcafcd1a.png"
  }
];

export default function Offerings() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  return (
    <section id="offerings" className="bg-black text-white">
      <div className="text-center py-16">
        <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">Other Offerings</h2>
        <p className="text-white/70 max-w-2xl mx-auto px-6">
          Beyond real estate, we provide access to exclusive premium assets and opportunities
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row w-full">
        {offerings.map((offering, index) => (
          <div 
            key={offering.id}
            className={`tri-split-item flex-1 h-[450px] md:h-[600px] ${
              hoveredIndex === index ? 'md:flex-[1.5]' : 'md:flex-1'
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="relative w-full h-full">
              <img 
                src={offering.backgroundImage} 
                alt={offering.title}
                className={`tri-split-image ${
                  hoveredIndex === index ? 'grayscale-0' : 'grayscale'
                } transition-all duration-700`}
              />
            </div>
            
            <div className="tri-split-content">
              <div className="p-8 text-center flex flex-col items-center">
                <div className="bg-white/10 backdrop-blur-md rounded-full p-4 inline-block mb-4">
                  {offering.icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-semibold mb-3">
                  {offering.title}
                </h3>
                <p className="text-white/80 max-w-xs mx-auto mb-6">
                  {offering.description}
                </p>
                
                {/* Get in touch button that appears on hover */}
                <div className={`transition-all duration-500 ${
                  hoveredIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  <Button 
                    variant="outline" 
                    className="bg-transparent border border-white text-white hover:bg-white hover:text-black"
                  >
                    Get in touch
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
