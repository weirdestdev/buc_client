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
import { PenSquare, Trash2, Plus, Star } from 'lucide-react';
import { Context } from '../../main';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

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
  priceOnRequest: boolean;
}

type ActiveTab = 'Our Portfolio' | 'Leisure' | 'Rentals';

const ListingManager = observer(() => {
  const { rentTimeStore, categoriesStore } = useContext(Context)!;

  // === state ===
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
    priceOnRequest: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileFields, setFileFields] = useState<Array<File | null>>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [customFieldsValues, setCustomFieldsValues] = useState<Record<string, string>>({});
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // === load on mount ===
  useEffect(() => {
    rentTimeStore.loadRentals();
    categoriesStore.loadCategories();
    rentTimeStore.loadRentTimes();
  }, [rentTimeStore, categoriesStore]);

  // === image count check ===
  const totalImages = fileFields.filter(Boolean).length + existingImages.length;
  const isTooManyImages = totalImages > 15;

  // === validation ===
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Title is required';
    if (!formData.address.trim()) newErrors.address = 'Location is required';
    if (!formData.status.trim()) newErrors.status = 'Primary Category is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.priceOnRequest && !formData.price) newErrors.price = 'Price is required';
    if (
      !formData.priceOnRequest &&
      ['rentals', 'leisure'].includes(formData.status.toLowerCase()) &&
      !formData.unit_of_numeration.trim()
    ) {
      newErrors.unit_of_numeration = 'Price Period is required';
    }
    if (
      !['our portfolio', 'leisure'].includes(formData.status.toLowerCase()) &&
      !formData.rentTimeId
    ) {
      newErrors.rentTimeId = 'Rent Time is required';
    }
    if (totalImages === 0) newErrors.images = 'At least one image is required';
    if (isTooManyImages) newErrors.images = 'You can upload no more than 15 images';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // === handlers ===
  const toggleFeatured = async (listing: any) => {
    const form = new FormData();
    form.append('featured', JSON.stringify(!listing.featured));
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
      priceOnRequest: false,
    });
    setErrors({});
    setFileFields([]);
    setPdfFile(null);
    setCustomFieldsValues({});
    setExistingImages([]);
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
      priceOnRequest: listing.price === 0,
    });
    setErrors({});
    setCustomFieldsValues(
      listing.rental_custom_data
        ? listing.rental_custom_data.reduce((acc: Record<string, string>, curr: any) => {
          acc[curr.categoriesDataId] = curr.value;
          return acc;
        }, {})
        : {}
    );
    let imgs = listing.rentals_images || [];
    if (imgs.every((i: any) => i.order === 0)) {
      imgs = imgs.map((i: any, idx: number) => ({ ...i, order: idx }));
    }
    setExistingImages(imgs);
    setFileFields([]);
    setPdfFile(null);
    setIsDialogOpen(true);
  };

  const addFileField = () => {
    setFileFields((f) => [...f, null]);
  };

  const handleFileFieldChange = (e: ChangeEvent<HTMLInputElement>, idx: number) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    setFileFields((f) => {
      const copy = [...f];
      copy.splice(idx, 1, ...filesArray);
      return copy;
    });
  };

  const handlePdfFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleDeleteListing = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    setIsLoading(true);
    try {
      await rentTimeStore.removeRental(id);
      await rentTimeStore.loadRentals();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveListing = async () => {
    if (!validateForm()) return;
    setIsDialogOpen(false);
    setIsLoading(true);
    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('address', formData.address);
      form.append('price', formData.priceOnRequest ? '0' : formData.price);
      if (
        !formData.priceOnRequest &&
        ['rentals', 'leisure'].includes(formData.status.toLowerCase())
      ) {
        form.append('unit_of_numeration', formData.unit_of_numeration);
      }
      form.append('status', formData.status);
      form.append('featured', JSON.stringify(formData.featured));
      form.append('categoryId', formData.categoryId);
      if (!['our portfolio', 'leisure'].includes(formData.status.toLowerCase())) {
        form.append('rentTimeId', formData.rentTimeId);
      }
      form.append(
        'customData',
        JSON.stringify(
          Object.entries(customFieldsValues).map(([fieldId, value]) => ({
            categoriesDataId: fieldId,
            value,
          }))
        )
      );
      if (fileFields.some((f) => f)) {
        fileFields.forEach((f) => f && form.append('images', f));
      } else {
        form.append(
          'updatedImages',
          JSON.stringify(
            existingImages.map((img, idx) => ({
              id: img.id,
              image: img.image,
              order: idx,
            }))
          )
        );
      }
      if (pdfFile) form.append('pdf', pdfFile);

      if (editingListing) {
        await rentTimeStore.updateRental(editingListing.id, form);
      } else {
        await rentTimeStore.addRental(form);
      }
      await rentTimeStore.loadRentals();
      setFileFields([]);
      setPdfFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // === rendering helpers ===
  const renderExistingImages = () => (
    <div className={`flex flex-wrap gap-2 mt-2 ${isTooManyImages ? 'border-2 border-red-500 p-2 rounded' : ''}`}>
      {existingImages.map((imgObj: any, idx: number) => (
        <div key={imgObj.id} className="relative">
          <img
            src={imgObj.image.startsWith('http') ? imgObj.image : `${SERVER_URL}${imgObj.image}`}
            alt={`listing-${idx}`}
            className="h-24 w-24 object-cover rounded"
          />
          <button
            type="button"
            onClick={() =>
              setExistingImages((imgs) => imgs.filter((i) => i.id !== imgObj.id))
            }
            className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1"
          >
            ×
          </button>
          <div className="absolute left-0 top-0 flex flex-col">
            {idx > 0 && (
              <button
                type="button"
                onClick={() => {
                  const copy = [...existingImages];
                  [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
                  setExistingImages(copy);
                }}
                className="bg-gray-300 text-sm rounded mb-1 px-1"
              >
                ↑
              </button>
            )}
            {idx < existingImages.length - 1 && (
              <button
                type="button"
                onClick={() => {
                  const copy = [...existingImages];
                  [copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]];
                  setExistingImages(copy);
                }}
                className="bg-gray-300 text-sm rounded px-1"
              >
                ↓
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCustomFields = () => {
    const cat = categoriesStore.categories.find((c: any) => c.id.toString() === formData.categoryId);
    if (!cat?.customFields) return null;
    return (
      <div className="space-y-2">
        <Label>Custom Fields</Label>
        {cat.customFields.map((field: any) => {
          let type: 'text' | 'number' | 'date' = 'text';
          if (field.type === 'int' || field.type === 'double') type = 'number';
          if (field.type === 'date') type = 'date';
          return (
            <div key={field.id} className="space-y-1">
              <Label htmlFor={`custom-${field.id}`}>{field.name}</Label>
              <Input
                id={`custom-${field.id}`}
                type={type}
                value={customFieldsValues[field.id] || ''}
                onChange={(e) =>
                  setCustomFieldsValues((v) => ({ ...v, [field.id]: e.target.value }))
                }
              />
            </div>
          );
        })}
      </div>
    );
  };

  const renderCategory = (listing: any) => {
    if (!listing.category) return '-';
    return (
      <div className="flex items-center space-x-2">
        {listing.category.icon && (
          <img
            src={
              listing.category.icon.startsWith('http')
                ? listing.category.icon
                : `${SERVER_URL}${listing.category.icon}`
            }
            alt={listing.category.name}
            className="h-6 w-6 object-cover"
          />
        )}
        <span>{listing.category.name}</span>
      </div>
    );
  };

  const renderRentTime = (listing: any) => {
    const st = listing.status?.toLowerCase();
    if (st === 'our portfolio' || st === 'leisure') return '-';
    return listing.rent_time?.name || '-';
  };

  // === JSX ===
  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4">
        {(['Our Portfolio', 'Rentals', 'Leisure'] as ActiveTab[]).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Listing Management</h2>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Listing
        </Button>
      </div>

      {/* Table */}
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
            {rentTimeStore.rentals
              .filter((listing: any) => listing.status?.toLowerCase() === activeTab.toLowerCase())
              .map((listing: any) => (
                <TableRow key={listing.id}>
                  <TableCell>{listing.id}</TableCell>
                  <TableCell className="font-medium">{listing.name}</TableCell>
                  <TableCell>{listing.price}</TableCell>
                  <TableCell>
                    <Button variant="ghost" onClick={() => toggleFeatured(listing)}>
                      <Star color={listing.featured ? 'gold' : 'gray'} className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>{renderCategory(listing)}</TableCell>
                  <TableCell>{renderRentTime(listing)}</TableCell>
                  <TableCell className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(listing)}>
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
            {rentTimeStore.rentals.filter((l: any) => l.status?.toLowerCase() === activeTab.toLowerCase()).length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No listings. Add a new listing.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingListing ? 'Edit Listing' : 'Add Listing'}</DialogTitle>
            <DialogDescription>
              {editingListing
                ? 'Edit the listing details'
                : 'Fill in the details for the new listing'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-1">
              <Label htmlFor="name">Title *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Listing Title"
                className={errors.name ? 'border border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            {/* Location */}
            <div className="space-y-1">
              <Label htmlFor="address">Location *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Location"
                className={errors.address ? 'border border-red-500' : ''}
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </div>

            {/* Price on Request */}
            <div className="space-y-2">
              <Label>
                <input
                  type="checkbox"
                  checked={formData.priceOnRequest}
                  onChange={(e) =>
                    setFormData({ ...formData, priceOnRequest: e.target.checked })
                  }
                  className="mr-2"
                />
                Price on Request
              </Label>
            </div>

            {/* Price & Period */}
            {!formData.priceOnRequest && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Price"
                    className={errors.price ? 'border border-red-500' : ''}
                  />
                  {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                </div>
                {(formData.status.toLowerCase() === 'rentals' ||
                  formData.status.toLowerCase() === 'leisure') && (
                    <div className="space-y-1">
                      <Label htmlFor="unit_of_numeration">Price Period *</Label>
                      <Input
                        id="unit_of_numeration"
                        value={formData.unit_of_numeration}
                        onChange={(e) =>
                          setFormData({ ...formData, unit_of_numeration: e.target.value })
                        }
                        placeholder="e.g. Month, Week, Day"
                        className={errors.unit_of_numeration ? 'border border-red-500' : ''}
                      />
                      {errors.unit_of_numeration && (
                        <p className="text-red-500 text-sm">{errors.unit_of_numeration}</p>
                      )}
                    </div>
                  )}
              </>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v.length <= 1000) setFormData({ ...formData, description: v });
                }}
                placeholder="Description"
              />
              <div className="text-right text-xs">
                <span className={formData.description.length >= 1000 ? 'text-red-500' : 'text-gray-500'}>
                  {1000 - formData.description.length}
                </span>
              </div>
            </div>

            {/* Primary Category */}
            <div className="space-y-1">
              <Label htmlFor="status">Primary Category *</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={`border rounded p-2 w-full ${errors.status ? 'border-red-500' : ''}`}
              >
                <option value="">Select Primary Category</option>
                <option value="our portfolio">Our Portfolio</option>
                <option value="leisure">Leisure</option>
                <option value="rentals">Rentals</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1">
              <Label htmlFor="categoryId">Category *</Label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className={`border rounded p-2 w-full ${errors.categoryId ? 'border-red-500' : ''}`}
              >
                <option value="">Select Category</option>
                {categoriesStore.categories
                  .filter((cat: any) => {
                    const st = formData.status.toLowerCase();
                    const nm = cat.name.toLowerCase();
                    if (st === 'leisure') return nm === 'cars' || nm === 'yachts';
                    if (st === 'our portfolio' || st === 'rentals') return nm !== 'cars' && nm !== 'yachts';
                    return true;
                  })
                  .map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId}</p>}
            </div>

            {/* Rent Time */}
            {formData.status.toLowerCase() !== 'our portfolio' &&
              formData.status.toLowerCase() !== 'leisure' && (
                <div className="space-y-1">
                  <Label htmlFor="rentTimeId">Rent Time *</Label>
                  <select
                    id="rentTimeId"
                    value={formData.rentTimeId}
                    onChange={(e) => setFormData({ ...formData, rentTimeId: e.target.value })}
                    className={`border rounded p-2 w-full ${errors.rentTimeId ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Rent Time</option>
                    {rentTimeStore.rentTimes.map((rt: any) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name}
                      </option>
                    ))}
                  </select>
                  {errors.rentTimeId && <p className="text-red-500 text-sm">{errors.rentTimeId}</p>}
                </div>
              )}

            {/* Custom Fields */}
            {renderCustomFields()}

            {/* Images */}
            <div className="space-y-2">
              <Label>Images *</Label>
              {editingListing && renderExistingImages()}
              {!editingListing && (
                <div className={`flex flex-wrap gap-2 mt-2 ${isTooManyImages ? 'border-2 border-red-500 p-2 rounded' : ''}`}>
                  {fileFields.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        type="file"
                        multiple
                        onChange={(e) => handleFileFieldChange(e, idx)}
                      />
                      {file && (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview-${idx}`}
                          className="h-12 w-12 object-cover rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <Button onClick={addFileField} variant="outline">
                Add Image Field
              </Button>
              {isTooManyImages && (
                <p className="text-red-500 text-sm">
                  You can upload no more than 15 images.
                </p>
              )}
              {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
            </div>

            {/* PDF File */}
            <div className="space-y-2">
              <Label>PDF File</Label>
              {editingListing && editingListing.pdfLink && (
                <div className="flex items-center bg-gray-100 p-2 rounded">
                  <a
                    href={editingListing.pdfLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    Current PDF
                  </a>
                </div>
              )}
              <Input type="file" accept="application/pdf" onChange={handlePdfFileChange} />
              {pdfFile && <p className="text-sm">Selected: {pdfFile.name}</p>}
            </div>
          </div>

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
    </div>
  );
});

export default ListingManager;
