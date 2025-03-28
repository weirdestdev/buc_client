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

const ListingManager = observer(() => {
  const { rentTimeStore } = useContext(Context)!;
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

    // Добавляем файлы, если они выбраны (ключ - images)
    if (files) {
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

  // Формирование полного пути к изображению (берем первый, если есть)
  const getImagePath = (images: string[]) => {
    if (!images || images.length === 0) return "";
    const img = images[0];
    if (img.startsWith('http')) return img;
    return `${SERVER_URL}${img}`;
  };

  return (
    <div className="space-y-6">
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
              <TableHead>Image</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rentTimeStore.rentals.map((listing: any) => (
              <TableRow key={listing.id}>
                <TableCell>{listing.id}</TableCell>
                <TableCell className="font-medium">{listing.name}</TableCell>
                <TableCell>{listing.price}</TableCell>
                <TableCell>
                  {listing.featured ? (
                    <Star className="h-4 w-4 text-yellow-500" />
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{listing.categoryId}</TableCell>
                <TableCell>{listing.rentTimeId}</TableCell>
                <TableCell>
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={getImagePath(listing.images)}
                      alt={listing.name}
                      className="h-6 w-6 object-cover"
                    />
                  ) : (
                    "-"
                  )}
                </TableCell>
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
            {rentTimeStore.rentals.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
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
              <Input
                id="images"
                type="file"
                multiple
                onChange={handleFileChange}
              />
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
