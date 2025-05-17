
import React, { useEffect, useState, useContext, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Portfolio from '@/components/Portfolio';
import JustArrived from '@/components/JustArrived';
import Leisure from '@/components/Leisure';
import { Button } from '@/components/ui/button';
import { LogOut, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SettingsDialog from '@/components/SettingsDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Context } from '../main';

const MemberPanel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isMobile = useIsMobile();

  const rootStore = useContext(Context);
  if (!rootStore) {
    throw new Error("RootStore не предоставлен в контексте");
  }
  const { userStore } = rootStore;

  const handleLogout = () => {
    userStore.logout(); // вызываем метод logout из store
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
    navigate('/');
  };

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar
          inMemberPanel={true}
          onSettingsClick={() => setSettingsOpen(true)}
          onLogoutClick={handleLogout}
        />

        <div className="flex-grow pt-32 pb-16 py-0">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-semibold">Member Panel</h1>

              {/* Only show buttons on desktop */}
              {!isMobile && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-primary/20 hover:bg-primary/10 hover:border-primary/30"
                    onClick={() => setSettingsOpen(true)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="border-primary/20 hover:bg-primary hover:text-white transition-all duration-500"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-muted/30 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-medium mb-2">Welcome back, {userStore.user?.fullname || 'Member'}</h2>
              <p className="text-muted-foreground">
                Here you can view all our exclusive properties and offerings.
              </p>
            </div>

            <div className="space-y-8">
              {/* Rentals first (justArrived component displays for sale properties here) */}
              <div>
                <JustArrived />
              </div>

              {/* Properties for Sale (Portfolio component displays rentals here) */}
              <div>
                <Portfolio />
              </div>

              {/* Leisure offerings */}
              <div>
                <Leisure />
              </div>
            </div>
          </div>
        </div>

        <Footer />

        {/* Settings Dialog */}
        <SettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      </div>
    </>);
};

export default MemberPanel;
