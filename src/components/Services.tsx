import React, { useState, useRef, useEffect } from 'react';
import { HardHat, ClipboardList, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreateMemberRequestModal from './CreateMemberRequestModal';

type Service = {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  backgroundImage: string;
};

const services: Service[] = [
  {
    id: 1,
    title: "Planning & Building",
    icon: <HardHat className="w-12 h-12" />,
    description: "Expert consultation on development projects, building regulations, and architectural planning.",
    backgroundImage: "/lovable-uploads/0e3cde34-d5b3-414f-8dbf-0fb564c94e59.png"
  },
  {
    id: 2,
    title: "Project Management",
    icon: <ClipboardList className="w-12 h-12" />,
    description: "Full-service project management for renovations, new builds, and property developments.",
    backgroundImage: "/lovable-uploads/79fde05a-6325-4413-b1b2-57c87609341c.png"
  },
  {
    id: 3,
    title: "Legal Assessment",
    icon: <Scale className="w-12 h-12" />,
    description: "Comprehensive legal guidance for property transactions, permits, and regulatory compliance.",
    backgroundImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

export default function Services() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const serviceRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Создаем наблюдатель, который будет отслеживать попадание блоков в область видимости
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-index'));
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setActiveIndex(index);
          }
        });
      },
      { threshold: 0.5 }
    );
    serviceRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => {
      serviceRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <section id="services" className="bg-gray-100">
      <div className="text-center py-16">
        <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">
          Our Services
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto px-6">
          Professional support throughout your property journey in Mallorca
        </p>
      </div>
      
      <div>
        {services.map((service, index) => (
          <div
            key={service.id}
            data-index={index}
            ref={(el) => (serviceRefs.current[index] = el)}
            className="relative w-full h-screen overflow-hidden"
          >
            <img
              src={service.backgroundImage}
              alt={service.title}
              className="w-full h-full object-cover"
            />
            <div
              className={`absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-center p-4 transition-all duration-700 
                ${activeIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              <div className="mb-4">
                {React.cloneElement(service.icon as React.ReactElement, {
                  className: "w-12 h-12 text-white mx-auto"
                })}
              </div>
              <h3 className="text-3xl font-display font-semibold text-white mb-2">
                {service.title}
              </h3>
              <p className="text-white max-w-md mx-auto mb-6">
                {service.description}
              </p>
              <Button
                variant="outline"
                className="bg-transparent border border-white text-white hover:bg-white hover:text-black"
                onClick={() => setIsModalOpen(true)}
              >
                Get in touch
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <CreateMemberRequestModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rentalName="From Services block"
      />
    </section>
  );
}
