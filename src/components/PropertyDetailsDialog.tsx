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
  Car, 
  Ship, 
  Clock, 
  Bold,
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

interface PropertyProps extends BaseItemProps {
  bedrooms: number;
  bathrooms: number;
  area: number;
  plotArea?: number;
}

interface LeisureProps extends BaseItemProps {
  duration: string;
  available: string;
  features: string;
}

type ItemProps = PropertyProps | LeisureProps;

interface PropertyDetailsDialogProps {
  property: ItemProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function isProperty(item: ItemProps): item is PropertyProps {
  return 'bedrooms' in item && 'bathrooms' in item && 'area' in item;
}

function isLeisure(item: ItemProps): item is LeisureProps {
  return 'duration' in item && 'available' in item && 'features' in item;
}

function PropertyDetailsDialog({ 
  property, 
  open, 
  onOpenChange 
}: PropertyDetailsDialogProps) {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  const { userStore } = useContext(Context); // Получаем store из контекста
  const isAuthenticated = userStore.isAuth;
  const user = userStore.user;

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

  // Get all images or default to an array with just the main image
  const allImages = property.images?.length ? property.images : [property.image];
  
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
  
  // Если пользователь авторизован, но его статус "pending" – показываем окно с сообщением об ожидании подтверждения
  if (user?.status === 'pending') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] backdrop-blur-lg bg-background/95">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl font-display text-center">Account Pending</DialogTitle>
            <DialogDescription className="text-center">
              Your account is pending administrator approval. Please wait.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4 pb-2">
            <Button onClick={handleMaybeLater} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Если пользователь авторизован и статус не pending, продолжаем рендерить детали объекта
  if (isProperty(property)) {
    const isRental = 
      property.type === 'longterm' || 
      property.type === 'shortterm' || 
      property.type === 'holiday';

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
                  {isRental && property.pricePeriod && (
                    <span className="text-xs ml-1">/{property.pricePeriod}</span>
                  )}
                </div>
              </div>
              
              {property.bedrooms > 0 && (
                <div className="bg-secondary rounded-md p-3 text-center">
                  <div className="text-sm text-muted-foreground">Bedrooms</div>
                  <div className="font-medium flex items-center justify-center mt-1">
                    <Bed className="w-4 h-4 mr-1" />
                    {property.bedrooms}
                  </div>
                </div>
              )}
              
              {property.bathrooms > 0 && (
                <div className="bg-secondary rounded-md p-3 text-center">
                  <div className="text-sm text-muted-foreground">Bathrooms</div>
                  <div className="font-medium flex items-center justify-center mt-1">
                    <Bath className="w-4 h-4 mr-1" />
                    {property.bathrooms}
                  </div>
                </div>
              )}
              
              <div className="bg-secondary rounded-md p-3 text-center">
                <div className="text-sm text-muted-foreground">Living Area</div>
                <div className="font-medium mt-1">
                  {property.area} m²
                </div>
              </div>
              
              {property.plotArea && property.plotArea > 0 && (
                <div className="bg-secondary rounded-md p-3 text-center">
                  <div className="text-sm text-muted-foreground">Plot Area</div>
                  <div className="font-medium flex items-center justify-center mt-1">
                    <Maximize2 className="w-4 h-4 mr-1" />
                    {property.plotArea} m²
                  </div>
                </div>
              )}
              
              {isRental && (
                <div className="bg-secondary rounded-md p-3 text-center">
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="font-medium mt-1">
                    {property.type === 'longterm'
                      ? 'Long Term Rental'
                      : property.type === 'shortterm'
                      ? 'Short Term Rental'
                      : property.type === 'holiday'
                      ? 'Holiday Rental'
                      : 'Rental'}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              {property.description ? (
                <p className="text-muted-foreground text-sm">{property.description}</p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {property.type === 'longterm' && 'This property is available for long-term rental with minimum 1-year contract.'}
                  {property.type === 'shortterm' && 'This property is available for short-term rental, perfect for seasonal stays of 1-6 months.'}
                  {property.type === 'holiday' && 'This luxury holiday rental is perfect for your vacation in Mallorca, available for daily or weekly rental.'}
                  {!isRental && 'This property is available for sale. Contact us for more details or to arrange a viewing.'}
                </p>
              )}
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
  
  if (isLeisure(property)) {
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
                  <span className="text-xs ml-1">/{property.duration}</span>
                </div>
              </div>
              
              <div className="bg-secondary rounded-md p-3 text-center">
                <div className="text-sm text-muted-foreground">Type</div>
                <div className="font-medium flex items-center justify-center mt-1">
                  {property.type === 'car' && <Car className="w-4 h-4 mr-1" />}
                  {property.type === 'yacht' && <Ship className="w-4 h-4 mr-1" />}
                  {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                </div>
              </div>
              
              <div className="bg-secondary rounded-md p-3 text-center">
                <div className="text-sm text-muted-foreground">Availability</div>
                <div className="font-medium flex items-center justify-center mt-1">
                  <Clock className="w-4 h-4 mr-1" />
                  {property.available}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <p className="text-muted-foreground text-sm flex items-start">
                <Bold className="w-4 h-4 mr-2 mt-0.5" />
                {property.features}
              </p>
            </div>
            
            {property.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground text-sm">
                  {property.description}
                </p>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button>
                Make Reservation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return null;
}

export default observer(PropertyDetailsDialog);
