import React, { useState, useEffect, useContext } from 'react';
import {
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarDays,
  Building,
  Home,
  MapPin,
  EuroIcon,
  Bed,
  Bath,
  ArrowRight,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import PropertyDetailsDialog from '@/components/PropertyDetailsDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Context } from '@/main';
// Если используете MobX, можно обернуть компонент в observer из 'mobx-react-lite'
// import { observer } from 'mobx-react-lite';

interface PortfolioProps {
  openAuthDialog?: (tab: "login" | "register") => void;
}

export default function Portfolio({ openAuthDialog }: PortfolioProps) {
  const [category, setCategory] = useState<string>("all");
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);

  const { isAuthenticated, getAllPortfolioListings, getFeaturedPortfolioListings } = useAuth();
  const { rentTimeStore, userStore } = useContext(Context)!;
  const isMobile = useIsMobile();

  useEffect(() => {
    // Если данные берутся из стора (например, через MobX) и вы их фильтруете через getAllPortfolioListings,
    // можно комбинировать с загрузкой из rentTimeStore, если требуется.
    // Здесь для примера используем функции из useAuth.
    const properties = isAuthenticated ? getAllPortfolioListings() : getFeaturedPortfolioListings();
    let result = [...properties];
    if (category !== "all") {
      result = result.filter(property => property.category === category);
    }
    result.sort((a, b) =>
      sortDirection === 'asc' ? a.price - b.price : b.price - a.price
    );
    setFilteredProperties(result);
  }, [category, sortDirection, isAuthenticated, getAllPortfolioListings, getFeaturedPortfolioListings]);

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => ({
      ...prev,
      [id]: true
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(price);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'longterm':
        return <CalendarDays className="w-5 h-5" />;
      case 'shortterm':
        return <CalendarDays className="w-5 h-5" />;
      case 'holiday':
        return <CalendarDays className="w-5 h-5" />;
      default:
        return <CalendarDays className="w-5 h-5" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'longterm':
        return 'Long Term';
      case 'shortterm':
        return 'Short Term';
      case 'holiday':
        return 'Holiday';
      default:
        return 'Long Term';
    }
  };

  const getPricePeriodLabel = (pricePeriod?: string) => {
    switch (pricePeriod) {
      case 'month':
        return '/month';
      case 'week':
        return '/week';
      case 'day':
        return '/day';
      default:
        return '/month';
    }
  };

  const handlePropertyClick = (property: any) => {
    console.log('Clicked property:', property);
    // Если пользователь не авторизован – можно сразу вызвать окно регистрации
    if (!isAuthenticated && openAuthDialog) {
      openAuthDialog("register");
      return;
    }
    setSelectedProperty(property);
    setPropertyDialogOpen(true);
  };

  const renderPropertyCard = (property: any) => {
    // Поиск кастомных полей для Bedrooms/Bathrooms
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
          {/* Если пользователь не авторизован, показываем плашку */}
          {!isAuthenticated && (
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
            <h3 className="font-medium text-lg property-card-title">{property.title}</h3>
          </div>
          <div className="flex items-center text-muted-foreground text-sm mb-4 property-card-location">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>{property.address}</span>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="font-display text-lg font-medium flex items-center">
              <EuroIcon className="w-5 h-5 mr-1 flex-shrink-0" />
              {formatPrice(property.price)}
              <span className="text-xs ml-1">{getPricePeriodLabel(property.pricePeriod)}</span>
            </div>
            {(property.bedrooms > 0 || property.bathrooms > 0) && (
              <div className="text-sm text-muted-foreground flex items-center space-x-2">
                {property.bedrooms > 0 && (
                  <div className="flex items-center">
                    <Bed className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>{property.bedrooms}</span>
                  </div>
                )}
                {property.bedrooms > 0 && property.bathrooms > 0 && <span>·</span>}
                {property.bathrooms > 0 && (
                  <div className="flex items-center">
                    <Bath className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>{property.bathrooms}</span>
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
    <section id="portfolio" className="section-padding bg-white w-full overflow-hidden">
      <div className="container mx-auto px-0 sm:px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">Rentals</h2>
          <p className="text-muted-foreground">
            Browse our exclusive selection of premium properties for rent in Mallorca's most sought-after locations
          </p>
        </div>

        <div className="mb-12">
          <Tabs defaultValue="all" className="w-full" onValueChange={setCategory}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
              <div className="flex items-center gap-2 bg-secondary rounded-lg p-2 w-full md:w-auto">
                <button
                  onClick={() => setCategory("all")}
                  className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors flex-1 md:flex-none ${category === "all" ? "bg-primary text-white" : "hover:bg-secondary-foreground/10"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setCategory("longterm")}
                  className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors flex-1 md:flex-none ${category === "longterm" ? "bg-primary text-white" : "hover:bg-secondary-foreground/10"}`}
                >
                  Long Term
                </button>
                <button
                  onClick={() => setCategory("shortterm")}
                  className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors flex-1 md:flex-none ${category === "shortterm" ? "bg-primary text-white" : "hover:bg-secondary-foreground/10"}`}
                >
                  Short Term
                </button>
                <button
                  onClick={() => setCategory("holiday")}
                  className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors flex-1 md:flex-none ${category === "holiday" ? "bg-primary text-white" : "hover:bg-secondary-foreground/10"}`}
                >
                  Holiday
                </button>
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

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {filteredProperties.map(renderPropertyCard)}
              </div>
            </TabsContent>

            <TabsContent value="longterm" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {filteredProperties.map(renderPropertyCard)}
              </div>
            </TabsContent>

            <TabsContent value="shortterm" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {filteredProperties.map(renderPropertyCard)}
              </div>
            </TabsContent>

            <TabsContent value="holiday" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {filteredProperties.map(renderPropertyCard)}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Если пользователь не авторизован, выводим блок с предложением зарегистрироваться */}
        {!isAuthenticated && (
          <div className="mt-12 text-center">
            <div
              className="max-w-xl mx-auto rounded-lg overflow-hidden relative animate-gradient-slow"
              style={{
                background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
                backgroundSize: "200% 200%"
              }}
            >
              <div className="p-8">
                <h3 className="text-xl font-display font-medium mb-2">See More Properties</h3>
                <p className="text-muted-foreground mb-4">
                  Create an account to access our full portfolio of exclusive properties
                </p>
                <Button
                  onClick={() => openAuthDialog && openAuthDialog("register")}
                  className="mt-2 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-amber-200/20 group"
                  size="lg"
                >
                  <span className="group-hover:mr-1 transition-all duration-300">Sign up</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <PropertyDetailsDialog
        property={selectedProperty}
        open={propertyDialogOpen}
        onOpenChange={setPropertyDialogOpen}
      />
    </section>
  );
}
