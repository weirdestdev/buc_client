
import React, { useState } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

type Collaborator = {
  id: number;
  name: string;
  role: string;
  image: string;
  logoClass?: string;
  url: string;
};

const collaborators: Collaborator[] = [
  {
    id: 1,
    name: "Hoteland",
    role: "Luxury Real Estate Transactions",
    image: "/lovable-uploads/5aac05d7-bb5b-4a7c-8244-31ea40340f6e.png",
    logoClass: "max-h-56",
    url: "https://www.hoteland.es/en/"
  },
  {
    id: 2,
    name: "LexQuire",
    role: "International Tax & Law",
    image: "/lovable-uploads/42af46d1-f6c4-4dd7-9fab-6e2fb7e87b18.png",
    logoClass: "max-h-60",
    url: "https://lexquire.com/locations/mallorca/"
  },
  {
    id: 3,
    name: "SteelHous",
    role: "Construction",
    image: "/lovable-uploads/0928bcf9-fffb-412c-83d8-7651f503184c.png",
    logoClass: "max-h-60",
    url: "https://www.steelhous.es/"
  },
  {
    id: 4,
    name: "SEAGARDEN",
    role: "Garden & Pool Design",
    image: "/lovable-uploads/23c4de90-2a8c-4584-a47f-12ea5c902532.png",
    logoClass: "max-h-60",
    url: "https://seagarden.es/"
  },
  {
    id: 5,
    name: "Mallorquímica",
    role: "Paint Production",
    image: "/lovable-uploads/fb0a76aa-9fa1-4ac4-8f5b-e89682ae5488.png",
    logoClass: "max-h-60",
    url: "https://www.mallorquimica.com"
  },
  {
    id: 6,
    name: "Carme Arbona",
    role: "Interior Design",
    image: "/lovable-uploads/25623b27-1190-4695-981e-254b5069186c.png",
    logoClass: "max-h-56",
    url: "https://api.businessunit.club/static/camportfolio.pdf"
  }
];

export default function Collaborators() {
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  
  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };
  
  const handleCollaboratorClick = (url: string) => {
    if (url !== "#") {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <section id="collaborators" className="section-padding bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4 italic tracking-wide">Collaborators & Partners</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our network of trusted professionals ensures exceptional service across all aspects of your property journey
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {collaborators.map((collaborator, index) => (
            <div 
              key={collaborator.id}
              className="flex flex-col items-center text-center transition-all duration-500 hover-lift rounded-2xl p-4"
              style={{ animationDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredId(collaborator.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleCollaboratorClick(collaborator.url)}
            >
              <div className="relative mb-6 h-80 w-full flex items-center justify-center">
                <div className="w-full h-full flex items-center justify-center">
                  <img 
                    src={collaborator.image} 
                    alt={collaborator.name}
                    className={`
                      ${loadedImages[collaborator.id] ? 'opacity-100' : 'opacity-0'} 
                      transition-all duration-500
                      ${hoveredId === collaborator.id ? '' : 'grayscale'}
                      ${collaborator.logoClass || 'max-h-64'}
                      object-contain
                      ${collaborator.url !== "#" ? 'cursor-pointer' : ''}
                    `}
                    onLoad={() => handleImageLoad(collaborator.id)}
                  />
                </div>
              </div>
              <h3 className="text-xl font-display font-medium italic tracking-wide">{collaborator.name}</h3>
              <p className="text-muted-foreground mt-1">{collaborator.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
