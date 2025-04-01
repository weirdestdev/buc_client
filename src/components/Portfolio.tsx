import React, { useState, useEffect, useContext } from 'react';
import { ArrowDownAZ, ArrowUpAZ, MapPin, EuroIcon, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PropertyDetailsDialog from '@/components/PropertyDetailsDialog';
import { Context } from '@/main';

interface PortfolioProps {
  openAuthDialog?: (tab: "login" | "register") => void;
}

export default function Portfolio({ openAuthDialog }: PortfolioProps) {
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);

  const { rentTimeStore, userStore } = useContext(Context)!;

  useEffect(() => {
    async function loadProperties() {
      await rentTimeStore.loadRentalsByStatus('our portfolio');
      let properties = rentTimeStore.rentals;

      // Фильтрация по featured
      properties = properties.filter(property => property.featured === true);

      // Сортировка по rentTimeId (вместо несуществующего rent_time)
      properties.sort((a, b) =>
        sortDirection === 'asc'
          ? a.rentTimeId - b.rentTimeId
          : b.rentTimeId - a.rentTimeId
      );

      setFilteredProperties(properties);
    }
    loadProperties();
  }, [sortDirection, rentTimeStore]);

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => ({
      ...prev,
      [id]: true
    }));
  };

  const handlePropertyClick = (property: any) => {
    if (!userStore.isAuth && openAuthDialog) {
      openAuthDialog("register");
      return;
    }
    setSelectedProperty(property);
    setPropertyDialogOpen(true);
  };

  return (
    <section className="section-padding bg-muted/30 w-full overflow-hidden">
      <div className="container mx-auto px-0 sm:px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">Our Portfolio</h2>
          <p className="text-muted-foreground">
            Explore our newest properties for sale that have just been added to our exclusive collection
          </p>
        </div>

        <div className="mb-12">
          <div className="flex justify-end mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1"
            >
              {sortDirection === 'asc' ? <ArrowUpAZ className="w-4 h-4" /> : <ArrowDownAZ className="w-4 h-4" />}
              <span>Sort by Rent Time</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {filteredProperties.map(property => (
              <Card key={property.id} className="cursor-pointer" onClick={() => handlePropertyClick(property)}>
                <div className="relative">
                  <div className="image-loading h-60 relative">
                    <img
                      src={property.images?.[0] || '/fallback-image.jpg'}
                      alt={property.name}
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${loadedImages[property.id] ? 'loaded' : ''}`}
                      onLoad={() => handleImageLoad(property.id)}
                    />
                  </div>
                  {!userStore.isAuth && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="font-medium text-lg">{property.name}</h3>
                  <div className="flex items-center text-muted-foreground text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{property.address}</span>
                  </div>
                  <div className="font-display text-lg font-medium flex items-center">
                    <EuroIcon className="w-5 h-5 mr-1" />
                    {property.price.toLocaleString('de-DE')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <PropertyDetailsDialog property={selectedProperty} open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen} />
    </section>
  );
}
