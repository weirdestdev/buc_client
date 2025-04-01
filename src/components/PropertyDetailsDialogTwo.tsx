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
  Users, 
  ArrowRight, 
  Lock 
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Context } from '@/main';

// Обновленный интерфейс, чтобы соответствовать JSON-данным
interface RentalCustomData {
  id: number;
  value: string;
  categories_datum: {
    id: number;
    name: string;
    type: string;
  };
}

interface BaseItemProps {
  id: number;
  name: string;
  description: string;
  address: string;
  price: number;
  unit_of_numeration: string;
  category: { id: number; name: string };
  rent_time: { id: number; name: string };
  rentals_images: { id: number; image: string }[];
  rental_custom_data: RentalCustomData[];
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

  if (!property) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(price);
  };

  const handleSignIn = () => {
    onOpenChange(false);
    setAuthDialogOpen(true);
  };

  const allImages = property.rentals_images.length
    ? property.rentals_images.map(img => img.image)
    : ["/default-image.jpg"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">{property.name}</DialogTitle>
          <DialogDescription className="flex items-center text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1" />
            {property.address}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Карусель изображений */}
          <Carousel className="w-full">
            <CarouselContent>
              {allImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-video rounded-md overflow-hidden">
                    <img 
                      src={image} 
                      alt={`${property.name} - image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-end gap-2 mt-2">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>

          {/* Блок информации */}
          <div className="grid grid-cols-2 gap-4">
            {/* Цена */}
            <div className="bg-secondary rounded-md p-3 text-center">
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="font-display font-medium flex items-center justify-center mt-1">
                <Euro className="w-4 h-4 mr-1" />
                {formatPrice(property.price)}
                <span className="text-xs ml-1">/{property.unit_of_numeration.replace(/"/g, '')}</span>
              </div>
            </div>

            {/* Доступность и другие параметры */}
            {property.rental_custom_data.map((item) => (
              <div key={item.id} className="bg-secondary rounded-md p-3 text-center">
                <div className="text-sm text-muted-foreground">{item.categories_datum.name}</div>
                <div className="font-display font-medium flex items-center justify-center mt-1">
                  {item.categories_datum.name === "Peoples" ? (
                    <Users className="w-4 h-4 mr-1" />
                  ) : item.categories_datum.name === "Beds" ? (
                    <Bed className="w-4 h-4 mr-1" />
                  ) : null}
                  {item.value}
                </div>
              </div>
            ))}
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
