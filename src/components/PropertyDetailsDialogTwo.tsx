import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AuthDialog from '@/components/AuthDialog';
import { 
  MapPin, 
  Euro, 
  Bed, 
  Bath, 
  ArrowRight, 
  Lock, 
  Maximize2
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Context } from '@/main';

interface BaseItemProps {
  id: number;
  title: string;
  type: string;
  location: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  description?: string;
  pricePeriod?: string;
}

interface PropertyDetailsDialogProps {
  property: BaseItemProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PropertyDetailsDialog({ 
  property, 
  open, 
  onOpenChange 
}: PropertyDetailsDialogProps) {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { userStore } = useContext(Context);
  const isAuthenticated = userStore.isAuth;
  const user = userStore.user;

  // Если property не задан, ничего не рендерим
  if (!property) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(price);
  };

  const handleMaybeLater = () => {
    onOpenChange(false);
  };

  const handleSignIn = () => {
    onOpenChange(false);
    setAuthDialogOpen(true);
  };

  // Используем все изображения или просто основное
  const allImages = property.images && property.images.length ? property.images : [property.image];

  // Если пользователь не авторизован – показываем окно с кнопками входа/регистрации
  if (!isAuthenticated) {
    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[425px] backdrop-blur-lg bg-background/95">
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-xl font-display text-center">Members Only</DialogTitle>
              <DialogDescription className="text-center">
                Sign in or register to view exclusive details and make reservations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4 pb-2">
              <Button onClick={handleSignIn} className="w-full">
                Sign in or Register
              </Button>
              <Button variant="outline" onClick={handleMaybeLater} className="w-full">
                Maybe Later
              </Button>
              <p className="text-xs text-center text-muted-foreground pt-2">
                Access to details is exclusive to our registered members.
              </p>
            </div>
          </DialogContent>
        </Dialog>
        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      </>
    );
  }

  // Если пользователь авторизован, продолжаем рендерить детали объекта
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">{property.title}</DialogTitle>
          <DialogDescription className="flex items-center text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1" />
            {property.location}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Carousel className="w-full">
            <CarouselContent>
              {allImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-video rounded-md overflow-hidden">
                    <img 
                      src={image} 
                      alt={`${property.title} - image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-end gap-2 mt-2">
              <CarouselPrevious className="relative static translate-y-0 left-0" />
              <CarouselNext className="relative static translate-y-0 right-0" />
            </div>
          </Carousel>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-secondary rounded-md p-3 text-center">
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="font-display font-medium flex items-center justify-center mt-1">
                <Euro className="w-4 h-4 mr-1" />
                {formatPrice(property.price)}
                {property.pricePeriod && (
                  <span className="text-xs ml-1">/{property.pricePeriod}</span>
                )}
              </div>
            </div>
            {/* Здесь можно добавить другие детали, если они есть */}
          </div>
          <div>
            <h4 className="font-medium mb-2">About this property</h4>
            <p className="text-muted-foreground text-sm">{property.description}</p>
          </div>
          <div className="flex justify-end">
            <Button>
              Request Viewing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default observer(PropertyDetailsDialog);
