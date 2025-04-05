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

interface ServiceItemProps {
  service: Service;
  index: number;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  onOpenModal: () => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  index,
  hoveredIndex,
  setHoveredIndex,
  onOpenModal,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // На мобильных устройствах (ширина < 768px) используем IntersectionObserver
  useEffect(() => {
    if (window.innerWidth < 768 && ref.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setInView(entry.isIntersecting);
          });
        },
        { threshold: 0.5 }
      );
      observer.observe(ref.current);
      return () => {
        if (ref.current) observer.unobserve(ref.current);
      };
    }
  }, []);

  // Если блок в зоне видимости на мобильном устройстве – активируем эффект
  useEffect(() => {
    if (window.innerWidth < 768) {
      if (inView) {
        setHoveredIndex(index);
      } else if (hoveredIndex === index) {
        setHoveredIndex(null);
      }
    }
  }, [inView, index, hoveredIndex, setHoveredIndex]);

  return (
    <div
      ref={ref}
      className={`tri-split-item flex-1 h-[450px] md:h-[600px] ${
        hoveredIndex === index ? 'md:flex-[1.5]' : 'md:flex-1'
      }`}
      onMouseEnter={() => {
        if (window.innerWidth >= 768) setHoveredIndex(index);
      }}
      onMouseLeave={() => {
        if (window.innerWidth >= 768) setHoveredIndex(null);
      }}
    >
      <div className="relative w-full h-full">
        <img
          src={service.backgroundImage}
          alt={service.title}
          className={`tri-split-image ${
            hoveredIndex === index ? 'grayscale-0' : 'grayscale'
          } transition-all duration-700`}
        />
      </div>
      <div className="tri-split-content">
        <div className="p-8 text-center flex flex-col items-center">
          <div className="bg-white/10 backdrop-blur-md rounded-full p-4 inline-block mb-4 transition-colors group-hover:bg-white/5">
            {React.cloneElement(service.icon as React.ReactElement, {
              className: `w-12 h-12 text-white`
            })}
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-semibold mb-3 text-white">
            {service.title}
          </h3>
          <p className="text-white max-w-xs mx-auto mb-6">
            {service.description}
          </p>
          <div
            className={`transition-all duration-500 ${
              hoveredIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Button
              variant="outline"
              className="bg-transparent border border-white text-white hover:bg-white hover:text-black"
              onClick={onOpenModal}
            >
              Get in touch
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Services() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <div className="flex flex-col md:flex-row w-full">
        {services.map((service, index) => (
          <ServiceItem
            key={service.id}
            service={service}
            index={index}
            hoveredIndex={hoveredIndex}
            setHoveredIndex={setHoveredIndex}
            onOpenModal={() => setIsModalOpen(true)}
          />
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
