import React, { useState, useEffect, useContext } from 'react';
import { ArrowDownAZ, ArrowUpAZ, Car, Ship, EuroIcon, Bold, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import PropertyDetailsDialog from '@/components/PropertyDetailsDialog';
import { Context } from '@/main'; // проверьте путь импорта контекста

interface LeisureProps {
  openAuthDialog?: (tab: "login" | "register") => void;
}

export default function Leisure({
  openAuthDialog
}: LeisureProps) {
  const [leisureType, setLeisureType] = useState<string>("all");
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  
  const { isAuthenticated, getAllLeisureListings, getFeaturedLeisureListings } = useAuth();
  const { userStore } = useContext(Context)!;
  
  useEffect(() => {
    // Получаем элементы в зависимости от статуса авторизации
    const items = isAuthenticated 
      ? getAllLeisureListings() 
      : getFeaturedLeisureListings();
    
    let result = [...items];
    
    if (leisureType !== "all") {
      result = result.filter(item => item.type === leisureType);
    }
    
    result.sort((a, b) => {
      return sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
    });
    
    setFilteredItems(result);
  }, [leisureType, sortDirection, isAuthenticated, getAllLeisureListings, getFeaturedLeisureListings]);
  
  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => ({
      ...prev,
      [id]: true
    }));
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      maximumFractionDigits: 0
    }).format(price);
  };
  
  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setItemDialogOpen(true);
  };
  
  const renderLeisureCard = (item: any) => (
    <Card 
      key={item.id} 
      className="w-full overflow-hidden group hover-lift prevent-screenshot cursor-pointer" 
      onClick={() => handleItemClick(item)}
    >
      <div className="image-loading h-60 relative">
        <img 
          src={item.image} 
          alt={item.title} 
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${loadedImages[item.id] ? 'loaded' : ''}`} 
          onLoad={() => handleImageLoad(item.id)} 
        />
        {/* Отображаем плашку, если статус пользователя не "approved" */}
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
          <h3 className="font-medium text-lg property-card-title">{item.title}</h3>
        </div>
        <div className="flex flex-col space-y-2 mt-4">
          <div className="flex items-center text-sm text-muted-foreground property-card-features">
            <Bold className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>{item.features}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="font-display text-lg font-medium flex items-center">
            <EuroIcon className="w-5 h-5 mr-1 flex-shrink-0" />
            {formatPrice(item.price)}
            <span className="text-sm text-muted-foreground ml-1">/{item.duration}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <section id="leisure" className="section-padding bg-muted/10 w-full overflow-hidden">
      <div className="container mx-auto px-0 sm:px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">Leisure</h2>
          <p className="text-muted-foreground">
            Experience luxury on the road and sea with our exclusive collection
          </p>
        </div>
        
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
            <div className="flex items-center gap-2 bg-secondary rounded-lg p-2 w-full md:w-auto">
              <button 
                onClick={() => setLeisureType("all")} 
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex-1 md:flex-none ${leisureType === "all" ? "bg-primary text-white" : "hover:bg-secondary-foreground/10"}`}
              >
                All
              </button>
              <button 
                onClick={() => setLeisureType("car")} 
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex-1 md:flex-none ${leisureType === "car" ? "bg-primary text-white" : "hover:bg-secondary-foreground/10"}`}
              >
                <Car className="inline-block w-4 h-4 mr-1" />
                Cars
              </button>
              <button 
                onClick={() => setLeisureType("yacht")} 
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex-1 md:flex-none ${leisureType === "yacht" ? "bg-primary text-white" : "hover:bg-secondary-foreground/10"}`}
              >
                <Ship className="inline-block w-4 h-4 mr-1" />
                Yachts
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
            
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {filteredItems.map(renderLeisureCard)}
          </div>
        </div>
      </div>
      
      <PropertyDetailsDialog 
        property={selectedItem} 
        open={itemDialogOpen} 
        onOpenChange={setItemDialogOpen} 
      />
    </section>
  );
}
