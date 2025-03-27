
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Portfolio from '@/components/Portfolio';
import JustArrived from '@/components/JustArrived';
import Leisure from '@/components/Leisure';
import Services from '@/components/Services';
import Collaborators from '@/components/Collaborators';
import Footer from '@/components/Footer';
import InfoWidgets from '@/components/InfoWidgets';
import AuthDialog from '@/components/AuthDialog';

const Index = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [activeAuthTab, setActiveAuthTab] = useState<"login" | "register">("login");
  
  // Open auth dialog with specific tab
  const openAuthDialog = (tab: "login" | "register") => {
    setActiveAuthTab(tab);
    setAuthDialogOpen(true);
  };

  // Prevent screenshot functionality
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent print screen and common screenshot shortcuts
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.key === 'p') ||
        (e.metaKey && e.key === 'p') ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'i') ||
        (e.ctrlKey && e.shiftKey && e.key === 'c') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C')
      ) {
        e.preventDefault();
        return false;
      }
    };
    
    // Add a class to the body to prevent selection
    document.body.classList.add('prevent-screenshot');
    
    // Prevent right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    
    // Scroll animations
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      threshold: 0.1
    });
    
    document.querySelectorAll('.reveal').forEach(element => {
      observer.observe(element);
    });
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.body.classList.remove('prevent-screenshot');
      
      document.querySelectorAll('.reveal').forEach(element => {
        observer.unobserve(element);
      });
    };
  }, []);
  
  return (
    <div className="min-h-screen overflow-x-hidden w-full">
      <Navbar openAuthDialog={openAuthDialog} />
      <Hero />
      <JustArrived openAuthDialog={openAuthDialog} />
      <Portfolio openAuthDialog={openAuthDialog} />
      <Leisure openAuthDialog={openAuthDialog} />
      <Services />
      <Collaborators />
      <InfoWidgets />
      <Footer />
      
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        defaultTab={activeAuthTab}
      />
    </div>
  );
};

export default Index;
