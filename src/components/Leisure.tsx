import React, { useState, useEffect, useContext } from 'react';
import { ArrowDownAZ, ArrowUpAZ, MapPin, EuroIcon, CalendarDays, Bed, Bath, ArrowRight, Lock, Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import PropertyDetailsDialog from '@/components/PropertyDetailsDialogFour';
import { Context } from '@/main';
import NotApprovedDialog from './NotApprovedDialog';

interface RentalsProps {
  openAuthDialog?: (tab: "login" | "register") => void;
}

export default function Leisure({ openAuthDialog }: RentalsProps) {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>("all");
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const { rentTimeStore, userStore } = useContext(Context)!;
  const [notApprovedDialogOpen, setNotApprovedDialogOpen] = useState(false);
  const onMemberPanelRoot = location.pathname === '/member-panel';
  useEffect(() => {
    async function loadProperties() {
      let properties = [];
      // Загружаем данные с сервера через store
      await rentTimeStore.loadRentalsByStatus('leisure');
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
            <span>{property.description}</span>
          </div>
          <div className="flex justify-between items-center mt-4">
            {property.price !== 0 ?
              <div className="font-display text-lg font-medium flex items-center">
                {formatPrice(property.price)}
                <EuroIcon className="w-5 h-5 ml-1 mr-1" />
                <span className="text-sm text-muted-foreground ml-1">
                  /{property.unit_of_numeration.replace(/[^A-Za-zА-Яа-яЁё0-9\s]/g, '')}
                </span>
              </div> : <span>Price on request</span>}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <section id="leisure" className="section-padding bg-white w-full overflow-hidden">
      <div className="container mx-auto px-0 sm:px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">Leisure</h2>
          <p className="text-muted-foreground">
            Experience luxury on the road and sea with our exclusive collection
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
                    style={selectedCategory === cat.id ? { filter: 'brightness(0) invert(1)' } : {}}
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
        {userStore.isAuth &&
          userStore.user?.status === 'approved' &&
          !onMemberPanelRoot && (
            <div className="text-center mt-8">
              <a
                href="/member-panel#leisure"
                className="inline-block see-more text-primary font-medium"
              >
                See more listings
                <ArrowRight className="inline-block ml-1 align-middle" />
              </a>
            </div>
          )}

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
