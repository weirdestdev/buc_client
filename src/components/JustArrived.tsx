import React, { useState, useEffect, useContext } from 'react';
import {
  ArrowDownAZ,
  ArrowUpAZ,
  MapPin,
  EuroIcon,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PropertyDetailsDialog from '@/components/PropertyDetailsDialog';
import { Context } from '@/main';

interface OurPortfolioProps {
  openAuthDialog?: (tab: "login" | "register") => void;
}

export default function OurPortfolio({ openAuthDialog }: OurPortfolioProps) {
  const { rentTimeStore, userStore } = useContext(Context)!;
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);

  useEffect(() => {
    if (!rentTimeStore.rentals.length) {
      rentTimeStore.loadRentals();
    }
  }, [rentTimeStore]);

  useEffect(() => {
    // Фильтруем объявления, где status === "our portfolio"
    const filtered = rentTimeStore.rentals.filter((listing: any) => {
      return listing.status?.toLowerCase() === 'our portfolio';
    });
    // Сортировка по цене
    filtered.sort((a: any, b: any) =>
      sortDirection === 'asc' ? a.price - b.price : b.price - a.price
    );
    setFilteredProperties(filtered);
  }, [rentTimeStore.rentals, sortDirection]);

  const handleImageLoad = (id: number) => {
    setLoadedImages((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePropertyClick = (property: any) => {
    if (!userStore.user && openAuthDialog) {
      openAuthDialog("login");
    } else {
      setSelectedProperty(property);
    }
  };

  const renderCustomData = (property: any) => {
    if (!property.rental_custom_data || property.rental_custom_data.length === 0)
      return null;
    const customFields = property.category?.customFields || [];
    return (
      <div className="mt-2">
        {property.rental_custom_data.map((item: any) => {
          const field = customFields.find((f: any) => f.id === item.categoriesDataId);
          return (
            <div key={item.categoriesDataId} className="text-xs text-muted-foreground">
              <span className="font-medium">
                {field ? field.name : `Field ${item.categoriesDataId}`}:
              </span>{' '}
              <span>{item.value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPropertyCard = (property: any) => (
    <Card
      key={property.id}
      className="w-full overflow-hidden group hover-lift prevent-screenshot cursor-pointer"
      onClick={() => handlePropertyClick(property)}
    >
      <div className="h-60 relative">
        <img
          src={property.image}
          alt={property.title}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
            loadedImages[property.id] ? 'loaded' : ''
          }`}
          onLoad={() => handleImageLoad(property.id)}
        />
        {userStore.user?.status !== 'approved' && (
          <div className="absolute inset-0 bg-black/0 opacity-0 group-hover:opacity-100 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex items-center">
              <Lock className="w-4 h-4 text-primary mr-2" />
              <span className="text-xs font-medium">Members Only</span>
            </div>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-lg">{property.title}</h3>
        </div>
        <div className="flex items-center text-muted-foreground text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{property.location}</span>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="font-display text-lg font-medium flex items-center">
            <EuroIcon className="w-5 h-5 mr-1" />
            {formatPrice(property.price)}
          </div>
        </div>
        {renderCustomData(property)}
      </CardContent>
    </Card>
  );

  return (
    <section id="our-portfolio" className="section-padding bg-muted/30 w-full overflow-hidden">
      <div className="container mx-auto px-0 sm:px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">Our Portfolio</h2>
          <p className="text-muted-foreground">
            Explore our exclusive properties from our Our Portfolio collection.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
            }
            className="flex items-center gap-1 w-full md:w-auto"
          >
            {sortDirection === 'asc' ? (
              <>
                <ArrowUpAZ className="w-4 h-4" />
                <span>Price: Low to High</span>
              </>
            ) : (
              <>
                <ArrowDownAZ className="w-4 h-4" />
                <span>Price: High to Low</span>
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {filteredProperties.map(renderPropertyCard)}
        </div>
      </div>

      <PropertyDetailsDialog
        property={selectedProperty}
        open={!!selectedProperty}
        onOpenChange={(open) => {
          if (!open) setSelectedProperty(null);
        }}
      />
    </section>
  );
}
