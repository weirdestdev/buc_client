import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Star, PenSquare, Trash2, MapPin, Building, Home, Car, Ship, X, Plus, ImageIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ImageUploader from './ImageUploader';

type ListingType = 'portfolio' | 'justArrived' | 'leisure';

interface BaseListing {
  id: number;
  title: string;
  type: string;
  location: string;
  price: number;
  image: string;
  images?: string[];
  featured: boolean;
  description?: string;
  pricePeriod?: string;
}

interface PropertyListing extends BaseListing {
  bedrooms: number;
  bathrooms: number;
  area: number;
  plotArea?: number;
  category: string;
}

interface LeisureListing extends BaseListing {
  duration: string;
  available: string;
  features: string;
  category: string;
}

type Listing = PropertyListing | LeisureListing;

const MAX_IMAGES = 15;

const ListingManager = () => {
  const { toast } = useToast();
  const { 
    getAllPortfolioListings, 
    getAllJustArrivedListings, 
    getAllLeisureListings,
    saveListing,
    deleteListing
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState<ListingType>('portfolio');
  const [listings, setListings] = useState<Listing[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  
  const [formData, setFormData] = useState<Partial<Listing>>({
    title: '',
    type: '',
    location: '',
    price: 0,
    image: '',
    images: [],
    featured: false,
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    plotArea: 0,
    category: '',
    description: '',
    pricePeriod: 'total',
  });
  
  useEffect(() => {
    loadListings();
  }, [activeTab]);
  
  const loadListings = () => {
    let data: Listing[] = [];
    
    switch (activeTab) {
      case 'portfolio':
        data = getAllJustArrivedListings();
        break;
      case 'justArrived':
        data = getAllPortfolioListings();
        break;
      case 'leisure':
        data = getAllLeisureListings();
        break;
    }
    
    setListings(data);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as ListingType);
  };
  
  const handleAddNew = () => {
    let defaultData: Partial<Listing> = {
      title: '',
      type: activeTab === 'leisure' ? 'car' : 'house',
      location: '',
      price: 0,
      image: '',
      images: [],
      featured: false,
      category: '',
      description: ''
    };
    
    if (activeTab === 'portfolio') {
      defaultData = {
        ...defaultData,
        bedrooms: 0,
        bathrooms: 0,
        area: 0,
        plotArea: 0,
        category: 'longterm',
        pricePeriod: 'month'
      };
    } else if (activeTab === 'justArrived') {
      defaultData = {
        ...defaultData,
        bedrooms: 0,
        bathrooms: 0,
        area: 0,
        plotArea: 0,
        category: 'sale',
        pricePeriod: 'total'
      };
    } else {
      defaultData = {
        ...defaultData,
        duration: 'day',
        available: 'Immediate',
        features: '',
        category: 'rental'
      };
    }
    
    setFormData(defaultData);
    setEditingListing(null);
    setIsDialogOpen(true);
  };
  
  const handleEditListing = (listing: Listing) => {
    setFormData(listing);
    setEditingListing(listing);
    setIsDialogOpen(true);
  };
  
  const handleDeleteClick = (listing: Listing) => {
    setListingToDelete(listing);
    setIsDeleteConfirmOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (listingToDelete) {
      let sectionToDelete: ListingType;
      if (activeTab === 'portfolio') {
        sectionToDelete = 'justArrived';
      } else if (activeTab === 'justArrived') {
        sectionToDelete = 'portfolio';
      } else {
        sectionToDelete = activeTab;
      }
      
      deleteListing(sectionToDelete, listingToDelete.id);
      toast({
        title: "Listing deleted",
        description: `"${listingToDelete.title}" has been deleted.`,
      });
      loadListings();
    }
    setIsDeleteConfirmOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value,
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      featured: checked,
    });
  };

  const handleImageUploaded = (imageUrl: string) => {
    const currentImages = formData.images || [];
    
    if (currentImages.length >= MAX_IMAGES) {
      toast({
        title: "Maximum images reached",
        description: `You can only add up to ${MAX_IMAGES} images per listing`,
        variant: "destructive"
      });
      return;
    }

    if (currentImages.length === 0) {
      setFormData({
        ...formData,
        image: imageUrl,
        images: [imageUrl]
      });
    } else {
      setFormData({
        ...formData,
        images: [...currentImages, imageUrl]
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = formData.images || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    
    const newMainImage = newImages.length > 0 ? newImages[0] : '';
    
    setFormData({
      ...formData,
      image: newMainImage,
      images: newImages
    });
  };
  
  const handleSaveListing = () => {
    if (!formData.title || !formData.location || (!formData.image && (!formData.images || formData.images.length === 0))) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and add at least one image",
        variant: "destructive"
      });
      return;
    }
    
    try {
      let sectionToSave: ListingType;
      if (activeTab === 'portfolio') {
        sectionToSave = 'justArrived';
      } else if (activeTab === 'justArrived') {
        sectionToSave = 'portfolio';
      } else {
        sectionToSave = activeTab;
      }
      
      const savedId = saveListing(
        sectionToSave, 
        editingListing ? editingListing.id : null, 
        formData as any
      );
      
      toast({
        title: editingListing ? "Listing updated" : "Listing created",
        description: `"${formData.title}" has been ${editingListing ? 'updated' : 'created'}.`,
      });
      
      loadListings();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save listing.",
        variant: "destructive"
      });
    }
  };
  
  const toggleFeatured = (listing: Listing) => {
    try {
      let sectionToUpdate: ListingType;
      if (activeTab === 'portfolio') {
        sectionToUpdate = 'justArrived';
      } else if (activeTab === 'justArrived') {
        sectionToUpdate = 'portfolio';
      } else {
        sectionToUpdate = activeTab;
      }
      
      const updatedListing = { ...listing, featured: !listing.featured };
      saveListing(sectionToUpdate, listing.id, updatedListing);
      
      toast({
        title: updatedListing.featured ? "Added to featured" : "Removed from featured",
        description: `"${listing.title}" ${updatedListing.featured ? 'will now be visible' : 'will no longer be visible'} on the main page.`,
      });
      
      loadListings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update listing.",
        variant: "destructive"
      });
    }
  };
  
  const renderListingTypeIcon = (type: string) => {
    switch (type) {
      case 'house':
      case 'villa':
      case 'finca':
        return <Home className="h-4 w-4" />;
      case 'flat':
      case 'apartment':
      case 'building':
        return <Building className="h-4 w-4" />;
      case 'plot':
      case 'project':
        return <MapPin className="h-4 w-4" />;
      case 'car':
        return <Car className="h-4 w-4" />;
      case 'yacht':
        return <Ship className="h-4 w-4" />;
      case 'longterm':
      case 'shortterm':
      case 'holiday':
        return <Home className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'house':
        return 'House';
      case 'flat':
        return 'Flat';
      case 'villa':
        return 'Villa';
      case 'apartment':
        return 'Apartment';
      case 'building':
        return 'Building';
      case 'plot':
        return 'Plot';
      case 'longterm':
        return 'Long Term Rental';
      case 'shortterm':
        return 'Short Term Rental';
      case 'holiday':
        return 'Holiday Rental';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(price);
  };
  
  const renderPortfolioForm = () => (
    <>
      <div className="grid grid-cols-1 gap-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleInputChange}
              placeholder="Luxury Sea-View Villa"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Property Type</Label>
            <Select 
              value={formData.type || 'house'} 
              onValueChange={(value) => handleSelectChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="building">Building</SelectItem>
                <SelectItem value="plot">Plot</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              name="location"
              value={formData.location || ''}
              onChange={handleInputChange}
              placeholder="Port d'Andratx"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price (€) *</Label>
            <Input
              id="price"
              name="price"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.price || ''}
              onChange={handleInputChange}
              placeholder="4800"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pricePeriod">Price Period</Label>
            <Select 
              value={(formData as PropertyListing).pricePeriod || 'month'} 
              onValueChange={(value) => handleSelectChange('pricePeriod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select price period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Per Month</SelectItem>
                <SelectItem value="week">Per Week</SelectItem>
                <SelectItem value="day">Per Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input
              id="bedrooms"
              name="bedrooms"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={(formData as PropertyListing).bedrooms || 0}
              onChange={handleInputChange}
              placeholder="5"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              name="bathrooms"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={(formData as PropertyListing).bathrooms || 0}
              onChange={handleInputChange}
              placeholder="4"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="area">Living Area (m²)</Label>
            <Input
              id="area"
              name="area"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={(formData as PropertyListing).area || 0}
              onChange={handleInputChange}
              placeholder="450"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plotArea">Plot Area (m²)</Label>
            <Input
              id="plotArea"
              name="plotArea"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={(formData as PropertyListing).plotArea || 0}
              onChange={handleInputChange}
              placeholder="1200"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={(formData as PropertyListing).category || 'longterm'} 
              onValueChange={(value) => handleSelectChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="longterm">Long Term</SelectItem>
                <SelectItem value="shortterm">Short Term</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            placeholder="Provide a detailed description of the property..."
            rows={4}
          />
        </div>
        
        <div className="mt-2 mb-4">
          <ImageUploader 
            onImageUploaded={handleImageUploaded}
            maxImages={MAX_IMAGES}
            currentImagesCount={(formData.images || []).length}
          />
          
          {(formData.images?.length || 0) > 0 ? (
            <div className="mt-4">
              <Carousel className="w-full">
                <CarouselContent>
                  {(formData.images || []).map((img, idx) => (
                    <CarouselItem key={idx} className="basis-1/3">
                      <div className="relative aspect-square rounded overflow-hidden border">
                        <img 
                          src={img} 
                          alt={`Image ${idx+1}`} 
                          className="w-full h-full object-cover"
                        />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => handleRemoveImage(idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {idx === 0 && (
                          <div className="absolute bottom-1 left-1 bg-primary/80 text-white text-xs px-2 py-1 rounded">
                            Main
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-end gap-2 mt-2">
                  <CarouselPrevious className="relative static translate-y-0 left-0" />
                  <CarouselNext className="relative static translate-y-0 right-0" />
                </div>
              </Carousel>
              <p className="text-xs text-muted-foreground mt-2">
                {formData.images?.length} of {MAX_IMAGES} images. First image is used as the main image.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center border border-dashed rounded-md p-8 bg-muted/50 mt-2">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No images added</p>
                <p className="text-xs">Add at least one image</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <Switch 
            id="featured" 
            checked={formData.featured || false}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="featured" className="flex items-center cursor-pointer">
            <Star className="h-4 w-4 mr-2 text-yellow-500" />
            Featured on main page
          </Label>
        </div>
      </div>
    </>
  );
  
  const renderJustArrivedForm = () => (
    <>
      <div className="grid grid-cols-1 gap-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleInputChange}
              placeholder="Luxury Sea-View Villa"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Property Type</Label>
            <Select 
              value={formData.type || 'house'} 
              onValueChange={(value) => handleSelectChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="building">Building</SelectItem>
                <SelectItem value="plot">Plot</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              name="location"
              value={formData.location || ''}
              onChange={handleInputChange}
              placeholder="Port d'Andratx"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={(formData as PropertyListing).category || 'sale'} 
              onValueChange={(value) => handleSelectChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">For Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (€) *</Label>
            <Input
              id="price"
              name="price"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.price || ''}
              onChange={handleInputChange}
              placeholder="4800"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pricePeriod">Price Period</Label>
            <Select 
              value={(formData as PropertyListing).pricePeriod || 'total'} 
              onValueChange={(value) => handleSelectChange('pricePeriod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select price period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Total Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input
              id="bedrooms"
              name="bedrooms"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={(formData as PropertyListing).bedrooms || 0}
              onChange={handleInputChange}
              placeholder="5"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              name="bathrooms"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={(formData as PropertyListing).bathrooms || 0}
              onChange={handleInputChange}
              placeholder="4"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="area">Living Area (m²)</Label>
            <Input
              id="area"
              name="area"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={(formData as PropertyListing).area || 0}
              onChange={handleInputChange}
              placeholder="450"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="plotArea">Plot Area (m²)</Label>
          <Input
            id="plotArea"
            name="plotArea"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={(formData as PropertyListing).plotArea || 0}
            onChange={handleInputChange}
            placeholder="1200"
          />
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            placeholder="Provide a detailed description of the property..."
            rows={4}
          />
        </div>
        
        <div className="mt-2 mb-4">
          <ImageUploader 
            onImageUploaded={handleImageUploaded}
            maxImages={MAX_IMAGES}
            currentImagesCount={(formData.images || []).length}
          />
          
          {(formData.images?.length || 0) > 0 ? (
            <div className="mt-4">
              <Carousel className="w-full">
                <CarouselContent>
                  {(formData.images || []).map((img, idx) => (
                    <CarouselItem key={idx} className="basis-1/3">
                      <div className="relative aspect-square rounded overflow-hidden border">
                        <img 
                          src={img} 
                          alt={`Image ${idx+1}`} 
                          className="w-full h-full object-cover"
                        />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => handleRemoveImage(idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {idx === 0 && (
                          <div className="absolute bottom-1 left-1 bg-primary/80 text-white text-xs px-2 py-1 rounded">
                            Main
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-end gap-2 mt-2">
                  <CarouselPrevious className="relative static translate-y-0 left-0" />
                  <CarouselNext className="relative static translate-y-0 right-0" />
                </div>
              </Carousel>
              <p className="text-xs text-muted-foreground mt-2">
                {formData.images?.length} of {MAX_IMAGES} images. First image is used as the main image.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center border border-dashed rounded-md p-8 bg-muted/50 mt-2">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No images added</p>
                <p className="text-xs">Add at least one image</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <Switch 
            id="featured" 
            checked={formData.featured || false}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="featured" className="flex items-center cursor-pointer">
            <Star className="h-4 w-4 mr-2 text-yellow-500" />
            Featured on main page
          </Label>
        </div>
      </div>
    </>
  );
  
  const renderLeisureForm = () => (
    <>
      <div className="grid grid-cols-1 gap-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleInputChange}
              placeholder="Ferrari 488 Spider"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Item Type</Label>
            <Select 
              value={formData.type || ''}
              onValueChange={(value) => handleSelectChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="yacht">Yacht</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              name="location"
              value={formData.location || ''}
              onChange={handleInputChange}
              placeholder="Palma"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price (€) *</Label>
            <Input
              id="price"
              name="price"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.price || ''}
              onChange={handleInputChange}
              placeholder="950"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select 
              value={(formData as LeisureListing).duration || 'day'} 
              onValueChange={(value) => handleSelectChange('duration', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">Hour</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="available">Availability</Label>
            <Select 
              value={(formData as LeisureListing).available || ''} 
              onValueChange={(value) => handleSelectChange('available', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Immediate">Immediate</SelectItem>
                <SelectItem value="24h notice">24h notice</SelectItem>
                <SelectItem value="48h notice">48h notice</SelectItem>
                <SelectItem value="On request">On request</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="features">Features *</Label>
            <Input
              id="features"
              name="features"
              value={(formData as LeisureListing).features || ''}
              onChange={handleInputChange}
              placeholder="550 HP, Convertible"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            placeholder="Provide a detailed description of this leisure item..."
            rows={4}
          />
        </div>
        
        <div className="mt-2 mb-4">
          <ImageUploader 
            onImageUploaded={handleImageUploaded}
            maxImages={MAX_IMAGES}
            currentImagesCount={(formData.images || []).length}
          />
          
          {(formData.images?.length || 0) > 0 ? (
            <div className="mt-4">
              <Carousel className="w-full">
                <CarouselContent>
                  {(formData.images || []).map((img, idx) => (
                    <CarouselItem key={idx} className="basis-1/3">
                      <div className="relative aspect-square rounded overflow-hidden border">
                        <img 
                          src={img} 
                          alt={`Image ${idx+1}`} 
                          className="w-full h-full object-cover"
                        />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => handleRemoveImage(idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {idx === 0 && (
                          <div className="absolute bottom-1 left-1 bg-primary/80 text-white text-xs px-2 py-1 rounded">
                            Main
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-end gap-2 mt-2">
                  <CarouselPrevious className="relative static translate-y-0 left-0" />
                  <CarouselNext className="relative static translate-y-0 right-0" />
                </div>
              </Carousel>
              <p className="text-xs text-muted-foreground mt-2">
                {formData.images?.length} of {MAX_IMAGES} images. First image is used as the main image.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center border border-dashed rounded-md p-8 bg-muted/50 mt-2">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No images added</p>
                <p className="text-xs">Add at least one image</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <Switch 
            id="featured" 
            checked={formData.featured || false}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="featured" className="flex items-center cursor-pointer">
            <Star className="h-4 w-4 mr-2 text-yellow-500" />
            Featured on main page
          </Label>
        </div>
      </div>
    </>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Listing Management</h2>
        <Button onClick={handleAddNew}>Add New Listing</Button>
      </div>
      
      <Tabs defaultValue="portfolio" onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="portfolio">Our Portfolio (Rentals)</TabsTrigger>
          <TabsTrigger value="justArrived">Rentals (Sales)</TabsTrigger>
          <TabsTrigger value="leisure">Leisure</TabsTrigger>
        </TabsList>
        
        <TabsContent value="portfolio" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Featured</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={`portfolio-${listing.id}`}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFeatured(listing)}
                      >
                        <Star 
                          className={`h-5 w-5 ${listing.featured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                        />
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{listing.title}</TableCell>
                    <TableCell className="flex items-center">
                      {renderListingTypeIcon(listing.type)}
                      <span className="ml-2">{getTypeLabel(listing.type)}</span>
                    </TableCell>
                    <TableCell>{listing.location}</TableCell>
                    <TableCell>€{formatPrice(listing.price)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditListing(listing)}
                        >
                          <PenSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(listing)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {listings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No listings found. Add your first listing.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="justArrived" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Featured</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={`just-arrived-${listing.id}`}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFeatured(listing)}
                      >
                        <Star 
                          className={`h-5 w-5 ${listing.featured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                        />
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{listing.title}</TableCell>
                    <TableCell className="flex items-center">
                      {renderListingTypeIcon(listing.type)}
                      <span className="ml-2">{getTypeLabel(listing.type)}</span>
                    </TableCell>
                    <TableCell>{listing.location}</TableCell>
                    <TableCell>€{formatPrice(listing.price)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditListing(listing)}
                        >
                          <PenSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(listing)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {listings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No listings found. Add your first listing.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="leisure" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Featured</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={`leisure-${listing.id}`}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFeatured(listing)}
                      >
                        <Star 
                          className={`h-5 w-5 ${listing.featured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                        />
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{listing.title}</TableCell>
                    <TableCell className="flex items-center">
                      {renderListingTypeIcon(listing.type)}
                      <span className="ml-2 capitalize">{listing.type}</span>
                    </TableCell>
                    <TableCell>{listing.location}</TableCell>
                    <TableCell>€{formatPrice(listing.price)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditListing(listing)}
                        >
                          <PenSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(listing)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {listings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No listings found. Add your first listing.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingListing ? 'Edit Listing' : 'Add New Listing'}</DialogTitle>
            <DialogDescription>
              Fill in the details for your {activeTab === 'leisure' ? 'leisure item' : 'property'}. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          {activeTab === 'portfolio' && renderPortfolioForm()}
          {activeTab === 'justArrived' && renderJustArrivedForm()}
          {activeTab === 'leisure' && renderLeisureForm()}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveListing}>
              {editingListing ? 'Save Changes' : 'Create Listing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{listingToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListingManager;

