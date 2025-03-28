import React, { useState, useEffect, useContext, ChangeEvent } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { PenSquare, Trash2, Plus, X, Star } from 'lucide-react';
import { Context } from '../../main';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

// Определим тип для формы списка (объявления)
interface IListFormData {
  name: string;
  description: string;
  address: string;
  price: string;
  unit_of_numeration: string;
  status: string;
  featured: boolean;
  categoryId: string;
  rentTimeId: string;
}

type ActiveTab = 'Our Portfolio' | 'Leisure' | 'Rentals';

const ListingManager = observer(() => {
  const { rentTimeStore } = useContext(Context)!;
  const [activeTab, setActiveTab] = useState<ActiveTab>('Our Portfolio');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [formData, setFormData] = useState<IListFormData>({
    name: '',
    description: '',
    address: '',
    price: '',
    unit_of_numeration: '',
    status: '',
    featured: false,
    categoryId: '',
    rentTimeId: '',
  });
  // Для загрузки файлов (множественный выбор)
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    rentTimeStore.loadRentals();
  }, [rentTimeStore]);

  // Фильтрация объявлений по вкладкам, основываясь на названии категории (из включенной модели Categories)
  const filteredListings = rentTimeStore.rentals.filter((listing: any) => {
    const catName = listing.Category?.name?.toLowerCase() || '';
    if (activeTab === 'Our Portfolio') {
      return ['villa', 'apartment', 'plot', 'building'].includes(catName);
    }
    if (activeTab === 'Leisure') {
      return ['car', 'yacht'].includes(catName);
    }
    // Для вкладки Rentals – все остальные
    return !(['villa', 'apartment', 'plot', 'building', 'car', 'yacht'].includes(catName));
  });

  // Функция для переключения featured через обновление объявления (отправляем минимальный payload)
  const toggleFeatured = async (listing: any) => {
    const form = new FormData();
    form.append('featured', JSON.stringify(!listing.featured));
    // Вызов обновления с минимальными данными – остальные поля останутся прежними
    await rentTimeStore.updateRental(listing.id, form);
    await rentTimeStore.loadRentals();
  };

  const openAddDialog = () => {
    setEditingListing(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      price: '',
      unit_of_numeration: '',
      status: '',
      featured: false,
      categoryId: '',
      rentTimeId: '',
    });
    setFiles(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (listing: any) => {
    setEditingListing(listing);
    setFormData({
      name: listing.name || '',
      description: listing.description || '',
      address: listing.address || '',
      price: listing.price?.toString() || '',
      unit_of_numeration: listing.unit_of_numeration || '',
      status: listing.status || '',
      featured: listing.featured || false,
      categoryId: listing.categoryId?.toString() || '',
      rentTimeId: listing.rentTimeId?.toString() || '',
    });
    setFiles(null);
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const handleSaveListing = async () => {
    if (!formData.name || !formData.price) {
      alert("Введите обязательные поля: Name и Price");
      return;
    }

    const form = new FormData();
    form.append('name', formData.name);
    form.append('description', formData.description);
    form.append('address', formData.address);
    form.append('price', formData.price);
    form.append('unit_of_numeration', formData.unit_of_numeration);
    form.append('status', formData.status);
    form.append('featured', JSON.stringify(formData.featured));
    form.append('categoryId', formData.categoryId);
    form.append('rentTimeId', formData.rentTimeId);

    // Для добавления объявлений – файлы можно выбрать.
    // При редактировании, как сказано, поле файлов не изменяется, а отображаются уже загруженные изображения.
    if (!editingListing && files) {
      Array.from(files).forEach((file) => {
        form.append('images', file);
      });
    }

    if (editingListing) {
      await rentTimeStore.updateRental(editingListing.id, form);
    } else {
      await rentTimeStore.addRental(form);
    }
    await rentTimeStore.loadRentals();
    setIsDialogOpen(false);
  };

  const handleDeleteListing = async (id: number) => {
    if (window.confirm("Вы действительно хотите удалить это объявление?")) {
      await rentTimeStore.removeRental(id);
      await rentTimeStore.loadRentals();
    }
  };

  // Для категории выводим иконку и название
  const renderCategory = (listing: any) => {
    const category = listing.Category;
    if (!category) return '-';
    const icon = category.icon;
    return (
      <div className="flex items-center space-x-2">
        {icon && (
          <img
            src={icon.startsWith('http') ? icon : `${SERVER_URL}${icon}`}
            alt={category.name}
            className="h-6 w-6 object-cover"
          />
        )}
        <span>{category.name}</span>
      </div>
    );
  };

  // Для renttime выводим только название
  const renderRentTime = (listing: any) => {
    return listing.RentTime?.name || '-';
  };

  // При редактировании, если у объявления есть изображения, отобразим их (максимум 15)
  const renderExistingImages = (listing: any) => {
    if (!listing || !listing.images || listing.images.length === 0) return null;
    const images = listing.images.slice(0, 15);
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {images.map((img: string, index: number) => (
          <img
            key={index}
            src={img.startsWith('http') ? img : `${SERVER_URL}${img}`}
            alt={`listing-${index}`}
            className="h-12 w-12 object-cover rounded"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Вкладки */}
      <div className="flex space-x-4">
        {(['Our Portfolio', 'Leisure', 'Rentals'] as ActiveTab[]).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Listing Management</h2>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Listing
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Rent Time</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredListings.map((listing: any) => (
              <TableRow key={listing.id}>
                <TableCell>{listing.id}</TableCell>
                <TableCell className="font-medium">{listing.name}</TableCell>
                <TableCell>{listing.price}</TableCell>
                <TableCell>
                  <Button variant="ghost" onClick={() => toggleFeatured(listing)}>
                    <Star
                      className="h-4 w-4"
                      color={listing.featured ? "gold" : "gray"}
                    />
                  </Button>
                </TableCell>
                <TableCell>{renderCategory(listing)}</TableCell>
                <TableCell>{renderRentTime(listing)}</TableCell>
                <TableCell className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(listing)}
                  >
                    <PenSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteListing(listing.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredListings.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No listings. Add a new listing.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingListing ? "Edit Listing" : "Add Listing"}
            </DialogTitle>
            <DialogDescription>
              {editingListing
                ? "Edit the listing details"
                : "Fill in the details for the new listing"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Listing Name"
                required
              />
            </div>
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description"
              />
            </div>
            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Address"
              />
            </div>
            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="Price"
                required
              />
            </div>
            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit_of_numeration">Unit</Label>
              <Input
                id="unit_of_numeration"
                value={formData.unit_of_numeration}
                onChange={(e) =>
                  setFormData({ ...formData, unit_of_numeration: e.target.value })
                }
                placeholder="Unit (e.g. $, €, etc.)"
              />
            </div>
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                placeholder="Status (e.g. pending, approved, blocked)"
              />
            </div>
            {/* Featured */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="featured">Featured</Label>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked })
                }
              />
            </div>
            {/* Category ID */}
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category ID</Label>
              <Input
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                placeholder="Category ID"
              />
            </div>
            {/* Rent Time ID */}
            <div className="space-y-2">
              <Label htmlFor="rentTimeId">Rent Time ID</Label>
              <Input
                id="rentTimeId"
                value={formData.rentTimeId}
                onChange={(e) =>
                  setFormData({ ...formData, rentTimeId: e.target.value })
                }
                placeholder="Rent Time ID"
              />
            </div>
            {/* Images Upload */}
            <div className="space-y-2">
              <Label htmlFor="images">Images</Label>
              {/* При добавлении показываем file input, а при редактировании — просто выводим миниатюры */}
              {!editingListing ? (
                <Input
                  id="images"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                />
              ) : (
                renderExistingImages(editingListing)
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveListing}>
              {editingListing ? "Save Changes" : "Create Listing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default ListingManager;
