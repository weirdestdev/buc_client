import React, { useState, useEffect, useContext } from 'react';
import { ArrowDownAZ, ArrowUpAZ, MapPin, EuroIcon, CalendarDays, Bed, Bath, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import PropertyDetailsDialog from '@/components/PropertyDetailsDialogThree';
import { Context } from '@/main';
import { useLocation } from 'react-router-dom';
import NotApprovedDialog from './NotApprovedDialog';

interface RentalsProps {
  openAuthDialog?: (tab: "login" | "register") => void;
}

export default function Rentals({ openAuthDialog }: RentalsProps) {
  // Состояние для выбранного времени аренды вместо категории
  const [selectedRentTime, setSelectedRentTime] = useState<string | "all">("all");
  const [rentTimes, setRentTimes] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [notApprovedDialogOpen, setNotApprovedDialogOpen] = useState(false);

  const { rentTimeStore, userStore } = useContext(Context)!;
  const location = useLocation();

  useEffect(() => {
    async function loadData() {
      // Загружаем все времена аренды и все объявления (rentals)
      await rentTimeStore.loadRentTimes();
      await rentTimeStore.loadRentalsByStatus('rentals');
      setRentTimes(rentTimeStore.rentTimes);

      let rentals = [...rentTimeStore.rentals];
      // Если выбрано конкретное время аренды, фильтруем по rentTimeId
      if (selectedRentTime !== "all") {
        rentals = rentals.filter(rental => rental.rentTimeId === Number(selectedRentTime));
      }
      // Сортировка по цене (оставляем ту же логику сортировки)
      rentals.sort((a, b) =>
        sortDirection === 'asc'
          ? a.price - b.price
          : b.price - a.price
      );

      // Если не находимся в /member-panel, фильтруем: оставляем только featured объявления
      if (!location.pathname.includes('/member-panel')) {
        rentals = rentals.filter(rental => rental.featured);
      }

      setFilteredProperties(rentals);
    }
    loadData();
  }, [selectedRentTime, sortDirection, rentTimeStore, location.pathname]);


  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const handlePropertyClick = (property: any) => {
    // Если пользователь не аутентифицирован – открываем окно регистрации
    if (!userStore.isAuth) {
      if (openAuthDialog) openAuthDialog("register");
      return;
    }
    // Если пользователь аутентифицирован, но его статус не "approved" – открываем окно NotApprovedDialog
    if (userStore.user && userStore.user.status !== 'approved') {
      setNotApprovedDialogOpen(true);
      return;
    }
    // Иначе открываем модальное окно с подробностями объявления
    setSelectedProperty(property);
    setPropertyDialogOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(price);
  };

  const renderPropertyCard = (property: any) => {
    // Находим время аренды по rentTimeId
    const rentTime = rentTimes.find(rt => rt.id === property.rentTimeId);

    const bedroomsField = property.rental_custom_data?.find((item: any) => {
      const name = item.categories_datum.name.toLowerCase();
      return name.includes("bed") && !name.includes("bath");
    });

    const bathroomsField = property.rental_custom_data?.find((item: any) => {
      const name = item.categories_datum.name.toLowerCase();
      return name.includes("bath");
    });

    const sortedImages = (property.rentals_images || [])
      .map((img: any, idx: number) => ({
        ...img,
        order: typeof img.order === 'number' ? img.order : idx
      }))
      .sort((a, b) => a.order - b.order);

    const firstImage = sortedImages[0]?.image;

    return (
      <Card
        key={property.id}
        className="w-full overflow-hidden group hover-lift prevent-screenshot cursor-pointer"
        onClick={() => handlePropertyClick(property)}
      >
        <div className="image-loading h-60 relative">
          <div style={{ zIndex: "1" }} className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-calendar-days w-5 h-5" data-lov-id="src/components/Portfolio.tsx:52:15" data-lov-name="CalendarDays" data-component-path="src/components/Portfolio.tsx" data-component-line="52" data-component-file="Portfolio.tsx" data-component-name="CalendarDays" data-component-content="%7B%22className%22%3A%22w-5%20h-5%22%7D"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>
            <span>{rentTime ? rentTime.name : 'N/A'}</span>
          </div>
          {firstImage ? (
            <img
              src={firstImage}
              alt={property.name}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${loadedImages[property.id] ? 'loaded' : ''}`}
              onLoad={() => handleImageLoad(property.id)}
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm">
              No Image
            </div>
          )}
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
            <h3 className="font-medium text-lg">{property.name}</h3>
          </div>
          <div className="flex items-center text-muted-foreground text-sm mb-4">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>{property.address}</span>
          </div>
          <div className="flex justify-between items-center mt-4">
            {property.price !== 0 ?
              <div className="font-display text-lg font-medium flex items-center">
                {formatPrice(property.price)}
                <EuroIcon className="w-5 h-5 ml-1 mr-1" />
                <span className="text-sm text-muted-foreground ml-1">/{property.unit_of_numeration.replace(/[^A-Za-zА-Яа-яЁё0-9\s]/g, '')}</span>
              </div> : <span>Price on request</span>}
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
    <section id="portfolio" className="section-padding bg-white w-full overflow-hidden">
      <div className="container mx-auto px-0 sm:px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">Rentals</h2>
          <p className="text-muted-foreground">
            Browse our exclusive selection of premium properties for rent in Mallorca's most sought-after locations
          </p>
        </div>

        <div className="mb-12">
          <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedRentTime}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
              <div className="flex items-center gap-2 bg-secondary rounded-lg p-2 w-full md:w-auto">
                <button
                  onClick={() => setSelectedRentTime("all")}
                  className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors flex-1 md:flex-none ${selectedRentTime === "all" ? "bg-primary text-white" : "hover:bg-secondary-foreground/10"}`}
                >
                  All
                </button>
                {rentTimes.map(rt => (
                  <button
                    key={rt.id}
                    onClick={() => setSelectedRentTime(rt.id.toString())}
                    className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors flex-1 md:flex-none ${selectedRentTime === rt.id.toString() ? "bg-primary text-white" : "hover:bg-secondary-foreground/10"}`}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    {rt.name}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
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

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {filteredProperties.map(renderPropertyCard)}
              </div>
            </TabsContent>
          </Tabs>
          {userStore.isAuth && userStore.user?.status === 'approved' && (
            <div className="text-center mt-8">
              <a
                href="/member-panel#portfolio"
                className="inline-block see-more text-primary font-medium"
              >
                See more listings
                <ArrowRight className="inline-block ml-1 align-middle" />
              </a>
            </div>
          )}
        </div>

        {/* Если пользователь не авторизован, предлагаем зарегистрироваться */}
        {!userStore.isAuth && (
          <div className="mt-12 text-center">
            <div className="max-w-xl mx-auto rounded-lg overflow-hidden relative animate-gradient-slow" style={{
              background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
              backgroundSize: "200% 200%"
            }}>
              <div className="p-8">
                <h3 className="text-xl font-display font-medium mb-2">See More Options</h3>
                <p className="text-muted-foreground mb-4">
                  Create an account to access our full portfolio of exclusive offerings
                </p>
                <Button onClick={() => openAuthDialog && openAuthDialog("register")} className="mt-2 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-amber-200/20 group" size="lg">
                  <span className="group-hover:mr-1 transition-all duration-300">Sign up</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <PropertyDetailsDialog property={selectedProperty} open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen} />
      <NotApprovedDialog open={notApprovedDialogOpen} onOpenChange={setNotApprovedDialogOpen} />
    </section>
  );
}
