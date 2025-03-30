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
import { PenSquare, Trash2, Plus, Star } from 'lucide-react';
import { Context } from '../../main';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

// Интерфейс формы остался прежним, но будем использовать только необходимые поля
interface IListFormData {
  name: string;
  description: string;
  address: string; // будем отображать как Location
  price: string;
  unit_of_numeration: string; // используется как Price Period для Rentals и Leisure
  featured: boolean;
}

type ActiveTab = 'Our Portfolio' | 'Rentals' | 'Leisure';

const ListingManager = observer(() => {
  const { rentTimeStore, categoriesStore } = useContext(Context)!;
  // Изменён порядок вкладок
  const [activeTab, setActiveTab] = useState<ActiveTab>('Our Portfolio');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [formData, setFormData] = useState<IListFormData>({
    name: '',
    description: '',
    address: '',
    price: '',
    unit_of_numeration: '',
    featured: false,
  });

  // Состояние для динамических полей загрузки файлов
  const [fileFields, setFileFields] = useState<Array<File | null>>([]);
  // Дополнительные данные для кастомных полей оставляем без изменений
  const [customFieldsValues, setCustomFieldsValues] = useState<Record<string, string>>({});

  useEffect(() => {
    rentTimeStore.loadRentals();
    categoriesStore.loadCategories();
    rentTimeStore.loadRentTimes();
  }, [rentTimeStore, categoriesStore]);

  // Фильтрация объявлений по вкладкам по значению status
  const filteredListings = rentTimeStore.rentals.filter((listing: any) => {
    const status = listing.status?.toLowerCase() || '';
    return status === activeTab.toLowerCase();
  });

  const toggleFeatured = async (listing: any) => {
    const form = new FormData();
    form.append('featured', JSON.stringify(!listing.featured));
    await rentTimeStore.updateRental(listing.id, form);
    await rentTimeStore.loadRentals();
  };

  const openAddDialog = () => {
    setEditingListing(null);
    // При открытии формы, кроме очистки полей, можно установить статус на основе активной вкладки,
    // если это необходимо на сервере (например, listing.status = activeTab.toLowerCase())
    setFormData({
      name: '',
      description: '',
      address: '',
      price: '',
      unit_of_numeration: '',
      featured: false,
    });
    setFileFields([]);
    setCustomFieldsValues({});
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
      featured: listing.featured || false,
    });
    // Если у редактируемого объявления есть кастомные поля, оставляем их
    setCustomFieldsValues(listing.rental_custom_data
      ? listing.rental_custom_data.reduce((acc: Record<string, string>, curr: any) => {
        acc[curr.categoriesDataId] = curr.value;
        return acc;
      }, {} )
      : {}
    );
    setFileFields([]);
    setIsDialogOpen(true);
  };

  const addFileField = () => {
    setFileFields([...fileFields, null]);
  };

  const handleFileFieldChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newFileFields = [...fileFields];
      newFileFields.splice(index, 1, ...filesArray);
      setFileFields(newFileFields);
    }
  };

  // При сохранении можно добавить автоустановку статуса в зависимости от активной вкладки,
  // если сервер ожидает поле status
  const handleSaveListing = async () => {
    if (!formData.name || !formData.price) {
      alert("Введите обязательные поля: Title и Price");
      return;
    }

    const form = new FormData();
    form.append('name', formData.name);
    form.append('description', formData.description);
    form.append('address', formData.address); // Location
    form.append('price', formData.price);
    // Добавляем поле Price Period только если категория Rentals или Leisure
    if (activeTab === 'Rentals' || activeTab === 'Leisure') {
      form.append('unit_of_numeration', formData.unit_of_numeration);
    }
    form.append('featured', JSON.stringify(formData.featured));
    // Устанавливаем статус в соответствии с активной вкладкой
    form.append('status', activeTab.toLowerCase());

    const customDataArray = Object.entries(customFieldsValues).map(([fieldId, value]) => ({
      categoriesDataId: fieldId,
      value,
    }));
    form.append('customData', JSON.stringify(customDataArray));

    fileFields.forEach((file) => {
      if (file) {
        form.append('images', file);
      }
    });

    if (editingListing) {
      await rentTimeStore.updateRental(editingListing.id, form);
    } else {
      await rentTimeStore.addRental(form);
    }
    await rentTimeStore.loadRentals();
    setIsDialogOpen(false);
    setFileFields([]);
  };

  const handleDeleteListing = async (id: number) => {
    if (window.confirm("Вы действительно хотите удалить это объявление?")) {
      await rentTimeStore.removeRental(id);
      await rentTimeStore.loadRentals();
    }
  };

  // Для отображения категории и прочего оставляем как есть
  const renderCategory = (listing: any) => {
    const category = listing.category;
    if (!category) return '-';
    return (
      <div className="flex items-center space-x-2">
        {category.icon && (
          <img
            src={category.icon.startsWith('http') ? category.icon : `${SERVER_URL}${category.icon}`}
            alt={category.name}
            className="h-6 w-6 object-cover"
          />
        )}
        <span>{category.name}</span>
      </div>
    );
  };

  const renderRentTime = (listing: any) => {
    return listing.rent_time?.name || '-';
  };

  const renderExistingImages = (listing: any) => {
    if (!listing || !listing.rentals_images || listing.rentals_images.length === 0) return null;
    const images = listing.rentals_images.slice(0, 15);
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {images.map((imgObj: any, index: number) => {
          const img = imgObj.image;
          return (
            <img
              key={index}
              src={img.startsWith('http') ? img : `${SERVER_URL}${img}`}
              alt={`listing-${index}`}
              className="h-12 w-12 object-cover rounded"
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Вкладки в нужном порядке */}
      <div className="flex space-x-4">
        {(['Our Portfolio', 'Rentals', 'Leisure'] as ActiveTab[]).map((tab) => (
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
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Category</TableHead>
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
                    <Star className="h-4 w-4" color={listing.featured ? "gold" : "gray"} />
                  </Button>
                </TableCell>
                <TableCell>{renderCategory(listing)}</TableCell>
                <TableCell className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(listing)}>
                    <PenSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteListing(listing.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredListings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No listings. Add a new listing.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingListing ? "Edit Listing" : "Add Listing"}</DialogTitle>
            <DialogDescription>
              {editingListing ? "Edit the listing details" : "Fill in the details for the new listing"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Listing Title"
                required
              />
            </div>
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Location"
                required
              />
            </div>
            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Price"
                required
              />
            </div>
            {/* Price Period (только для Rentals и Leisure) */}
            {(activeTab === 'Rentals' || activeTab === 'Leisure') && (
              <div className="space-y-2">
                <Label htmlFor="unit_of_numeration">Price Period</Label>
                <Input
                  id="unit_of_numeration"
                  value={formData.unit_of_numeration}
                  onChange={(e) => setFormData({ ...formData, unit_of_numeration: e.target.value })}
                  placeholder="Price Period (e.g. Month, Week, Day)"
                />
              </div>
            )}
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
              />
            </div>
            {/* Featured */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="featured">Featured</Label>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
            </div>
            {/* Images Upload */}
            <div className="space-y-2">
              <Label htmlFor="images">Images</Label>
              {editingListing && renderExistingImages(editingListing)}
              {fileFields.map((file, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => handleFileFieldChange(e, index)}
                  />
                  {file && (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview-${index}`}
                      className="h-12 w-12 object-cover rounded"
                    />
                  )}
                </div>
              ))}
              <Button onClick={addFileField} variant="outline">
                Add Image Field
              </Button>
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
