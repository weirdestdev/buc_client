import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Building,
  Home,
  MapPin,
  EuroIcon,
  Bed,
  Bath,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PropertyDetailsDialog from '@/components/PropertyDetailsDialogTwo';
import { useAuth } from '@/context/AuthContext';
import { Context } from '@/main';

interface JustArrivedProps {
  openAuthDialog?: (tab: "login" | "register") => void;
}

export default function JustArrived({ openAuthDialog }: JustArrivedProps) {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>("all");
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);

  const { getFeaturedJustArrivedListings } = useAuth();
  const { rentTimeStore, userStore } = useContext(Context)!;

  useEffect(() => {
    async function loadProperties() {
      let properties = [];
      await rentTimeStore.loadRentalsByStatus('our portfolio');
      properties = rentTimeStore.rentals;

      // Если не находимся в /member-panel, фильтруем по featured = true
      if (!location.pathname.includes('/member-panel')) {
        properties = properties.filter(property => property.featured === true);
      }

      // Формируем массив уникальных категорий
      const uniqueCategoriesMap = {};
      properties.forEach(property => {
        if (property.category && !uniqueCategoriesMap[property.category.id]) {
          uniqueCategoriesMap[property.category.id] = property.category;
        }
      });
      setCategories(Object.values(uniqueCategoriesMap));

      // Фильтрация по выбранной категории (если не выбрано "all")
      let result = [...properties];
      if (selectedCategory !== "all") {
        result = result.filter(property => property.category?.id === selectedCategory);
      }

      // Сортировка по цене
      result.sort((a, b) =>
        sortDirection === 'asc' ? a.price - b.price : b.price - a.price
      );

      setFilteredProperties(result);
    }
    loadProperties();
  }, [selectedCategory, sortDirection, rentTimeStore, location.pathname]);

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => ({
      ...prev,
      [id]: true
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(price);
  };

  const handlePropertyClick = (property: any) => {
    if (!userStore.isAuth || (userStore.user && userStore.user.status !== 'approved')) {
      if (openAuthDialog) openAuthDialog("register");
      return;
    }
    setSelectedProperty(property);
    setPropertyDialogOpen(true);
  };
  

  const renderPropertyCard = (property: any) => {
    const bedroomsField = property.rental_custom_data?.find((item: any) => {
      const name = item.categories_datum.name.toLowerCase();
      return name.includes("bed") && !name.includes("bath");
    });
    const bathroomsField = property.rental_custom_data?.find((item: any) => {
      const name = item.categories_datum.name.toLowerCase();
      return name.includes("bath");
    });

    return (
      <Card
        key={property.id}
        className="w-full overflow-hidden group hover-lift prevent-screenshot cursor-pointer"
        onClick={() => handlePropertyClick(property)}
      >
        <div className="relative">
          <div className="image-loading h-60 relative">
            {property.rentals_images && property.rentals_images.length > 0 ? (
              <img
                src={property.rentals_images[0].image}
                alt={property.name}
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${loadedImages[property.id] ? 'loaded' : ''}`}
                onLoad={() => handleImageLoad(property.id)}
              />
            ) : (
              <img
                src={property.image || '/fallback-image.jpg'}
                alt={property.name}
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${loadedImages[property.id] ? 'loaded' : ''}`}
                onLoad={() => handleImageLoad(property.id)}
              />
            )}
          </div>
          {!userStore.isAuth && (
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
            <h3 className="font-medium text-lg property-card-title">{property.name}</h3>
          </div>
          <div className="flex items-center text-muted-foreground text-sm mb-4 property-card-location">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>{property.address}</span>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="font-display text-lg font-medium flex items-center">
              {formatPrice(property.price)}
              <EuroIcon className="w-5 h-5 ml-1 flex-shrink-0" />
            </div>
            {(bedroomsField || bathroomsField) && (
              <div className="text-sm text-muted-foreground flex items-center space-x-2">
                {bedroomsField && (
                  <div className="flex items-center">
                    <Bed className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>{bedroomsField.value}</span>
                  </div>
                )}
                {bedroomsField && bathroomsField && <span>·</span>}
                {bathroomsField && (
                  <div className="flex items-center">
                    <Bath className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>{bathroomsField.value}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <section id="just-arrived" className="section-padding bg-muted/30 w-full overflow-hidden">
      <div className="container mx-auto px-0 sm:px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">Our Portfolio</h2>
          <p className="text-muted-foreground">
            Explore our newest properties for sale that have just been added to our hand-picked collection
          </p>
        </div>

        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
            {/* Список категорий */}
            <div className="flex flex-wrap items-center gap-2 bg-secondary rounded-lg p-2 w-full md:w-auto">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex-1 md:flex-none ${selectedCategory === "all" ? "bg-primary text-white" : "hover:bg-secondary-foreground/10"}`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex-1 md:flex-none ${selectedCategory === cat.id ? "bg-primary text-white" : "hover:bg-secondary-foreground/10"
                    }`}
                >
                  <img
                    src={`${import.meta.env.VITE_SERVER_URL}${cat.icon}`}
                    alt={cat.name}
                    className="inline-block w-4 h-4 mr-1"
                    style={
                      selectedCategory === cat.id
                        ? { filter: 'brightness(0) invert(1)' }
                        : {}
                    }
                  />
                  {cat.name}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1 w-full md:w-auto self-end md:self-auto"
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
      </div>

      <PropertyDetailsDialog
        property={selectedProperty}
        open={propertyDialogOpen}
        onOpenChange={setPropertyDialogOpen}
      />
    </section>
  );
}
