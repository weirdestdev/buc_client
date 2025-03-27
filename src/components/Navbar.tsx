import React, { useState, useEffect, useRef, useContext } from 'react';
import { observer } from 'mobx-react-lite'; // Импорт observer
import { Menu, X, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import AuthDialog from './AuthDialog';
import Logo from './Logo';
import { Context } from '../main';

interface NavbarProps {
  openAuthDialog?: (tab: "login" | "register") => void;
  inMemberPanel?: boolean;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
}

function Navbar({
  openAuthDialog,
  inMemberPanel = false,
  onSettingsClick,
  onLogoutClick
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { toast } = useToast();
  const menuRef = useRef<HTMLDivElement>(null);

  const rootStore = useContext(Context);
  if (!rootStore) {
    throw new Error("RootStore не предоставлен в контексте");
  }
  const { userStore } = rootStore;
  const isAuthenticated = userStore.isAuth;
  const user = userStore.user;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuToggle = () => {
    if (isMobileMenuOpen) {
      setIsMenuClosing(true);
      setTimeout(() => {
        setIsMobileMenuOpen(false);
        setIsMenuClosing(false);
      }, 300);
    } else {
      setIsMobileMenuOpen(true);
    }
  };

  const handleMenuItemClick = () => {
    setIsMenuClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsMenuClosing(false);
    }, 300);
  };

  const handleAuthDialogOpen = (tab: "login" | "register" = "login") => {
    if (openAuthDialog) {
      openAuthDialog(tab);
    } else {
      setAuthDialogOpen(true);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'py-3 glass-effect'
            : 'py-6 bg-gradient-to-b from-black/15 via-black/10 to-transparent backdrop-blur-[2px]'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo isScrolled={isScrolled} />
            <a
              href="#"
              className={`font-display text-xl md:text-2xl font-semibold tracking-tight ${
                !isScrolled ? 'text-white' : ''
              }`}
            >
              Business Unit Club
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {!inMemberPanel && (
              <nav className={`flex space-x-6 text-sm ${!isScrolled ? 'text-white' : ''}`}>
                <a href="#just-arrived" className="hover:text-primary/80 transition-colors">
                  Our Portfolio
                </a>
                <a href="#portfolio" className="hover:text-primary/80 transition-colors">
                  Rentals
                </a>
                <a href="#leisure" className="hover:text-primary/80 transition-colors">
                  Leisure
                </a>
                <a href="#services" className="hover:text-primary/80 transition-colors">
                  Services
                </a>
                <a href="#collaborators" className="hover:text-primary/80 transition-colors">
                  Partners
                </a>
              </nav>
            )}

            {isAuthenticated ? (
              inMemberPanel ? (
                <></>
              ) : (
                <Button
                  variant={isScrolled ? "outline" : "secondary"}
                  className={
                    isScrolled
                      ? "border-primary/20 hover:bg-primary hover:text-white transition-all duration-500"
                      : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all duration-500"
                  }
                  asChild
                >
                  <Link to="/member-panel">
                    <User className="mr-1 h-4 w-4" />
                    Member Panel
                  </Link>
                </Button>
              )
            ) : (
              <Button
                variant={isScrolled ? "outline" : "secondary"}
                className={
                  isScrolled
                    ? "border-primary/20 hover:bg-primary hover:text-white transition-all duration-500"
                    : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all duration-500"
                }
                onClick={() => handleAuthDialogOpen("login")}
              >
                Member Login
              </Button>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <button
              className={`focus:outline-none ${!isScrolled ? 'text-white' : ''}`}
              onClick={handleMenuToggle}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {(isMobileMenuOpen || isMenuClosing) && (
        <div
          ref={menuRef}
          className={`fixed inset-0 z-40 md:hidden glass-effect ${
            isMenuClosing ? 'animate-fade-out' : 'animate-fade-in'
          }`}
        >
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            {inMemberPanel ? (
              <>
                {onSettingsClick && (
                  <button
                    className="flex items-center text-2xl font-medium"
                    onClick={() => {
                      handleMenuItemClick();
                      onSettingsClick();
                    }}
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    Settings
                  </button>
                )}

                {onLogoutClick && (
                  <button
                    className="flex items-center text-2xl font-medium"
                    onClick={() => {
                      handleMenuItemClick();
                      onLogoutClick();
                    }}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                  </button>
                )}
              </>
            ) : (
              <>
                <a
                  href="#just-arrived"
                  className="text-2xl font-medium"
                  onClick={handleMenuItemClick}
                >
                  Our Portfolio
                </a>
                <a
                  href="#portfolio"
                  className="text-2xl font-medium"
                  onClick={handleMenuItemClick}
                >
                  Rentals
                </a>
                <a
                  href="#leisure"
                  className="text-2xl font-medium"
                  onClick={handleMenuItemClick}
                >
                  Leisure
                </a>
                <a
                  href="#services"
                  className="text-2xl font-medium"
                  onClick={handleMenuItemClick}
                >
                  Services
                </a>
                <a
                  href="#collaborators"
                  className="text-2xl font-medium"
                  onClick={handleMenuItemClick}
                >
                  Partners
                </a>
              </>
            )}

            {isAuthenticated ? (
              !inMemberPanel && (
                <Button
                  variant="outline"
                  className="mt-8 border-primary/20 hover:bg-primary hover:text-white transition-all duration-500"
                  asChild
                  onClick={handleMenuItemClick}
                >
                  <Link to="/member-panel">
                    <User className="mr-1 h-4 w-4" />
                    Member Panel
                  </Link>
                </Button>
              )
            ) : (
              <Button
                variant="outline"
                className="mt-8 border-primary/20 hover:bg-primary hover:text-white transition-all duration-500"
                onClick={() => {
                  handleMenuItemClick();
                  handleAuthDialogOpen("login");
                }}
              >
                Member Login
              </Button>
            )}
          </div>
        </div>
      )}

      {!openAuthDialog && (
        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      )}
    </>
  );
}

// Оборачиваем компонент в observer
export default observer(Navbar);
