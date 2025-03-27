import React, { useState, useEffect, useContext, ChangeEvent } from 'react';
import { observer } from 'mobx-react-lite';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PenSquare, Lock, Unlock, Trash2, Plus, X } from 'lucide-react';
import { Context } from '../main';
import { ICategory } from '../store/CategoriesStore';

// Базовый URL сервера (при необходимости заменить на актуальный)
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const CategoriesTable = observer(() => {
  const { categoriesStore } = useContext(Context)!; // получаем CategoriesStore из контекста

  // Локальное состояние для диалога и формы редактирования/создания
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    image: '', // URL или имя файла (если не выбран новый)
    locked: false,
    // Для кастомных полей используем ключи, соответствующие серверу: 
    // name, type, minSize, maxSize, icon
    customFields: [] as Array<{
      id?: number;
      fieldName: string;
      fieldType: string;
      minSize: number | string;
      maxSize: number | string;
      icon: string;
    }>,
  });
  const [file, setFile] = useState<File | null>(null);

  // Загрузка категорий при монтировании компонента
  useEffect(() => {
    categoriesStore.loadCategories();
  }, [categoriesStore]);

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      image: '',
      locked: false,
      customFields: [],
    });
    setFile(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: ICategory) => {
    // Если категория заблокирована, редактирование не допускается
    if (category.isLocked) {
      alert("Эта категория заблокирована для редактирования");
      return;
    }
    setEditingCategory(category);
    // Преобразуем полученные с сервера кастомные поля:
    // сервер: { id, name, type, min_size, max_size, icon } 
    // в поля формы: { fieldName, fieldType, minSize, maxSize, icon }
    const mappedCustomFields = category.customFields.map((field: any) => ({
      id: field.id,
      fieldName: field.name,
      fieldType: field.type,
      minSize: field.min_size,
      maxSize: field.max_size,
      icon: field.icon || ""  // если иконка отсутствует, передаем пустую строку
    }));
    setFormData({
      name: category.name,
      image: category.icon, // используем поле icon как image
      locked: category.isLocked,
      customFields: mappedCustomFields,
    });
    setFile(null);
    setIsDialogOpen(true);
  };

  // Формирование полного пути к изображению
  const getImagePath = (icon: string) => {
    if (!icon) return "";
    if (icon.startsWith('http')) return icon;
    return `${SERVER_URL}${icon}`;
  };

  // При сохранении преобразуем кастомные поля в формат, ожидаемый сервером:
  // всегда массив объектов с ключами: name, type, minSize, maxSize, icon
  const handleSaveCategory = async () => {
    if (!formData.name) {
      alert("Введите название категории");
      return;
    }
    const form = new FormData();
    form.append('name', formData.name);
    form.append('isLocked', JSON.stringify(formData.locked));
    // Если выбран новый файл, передаем его, иначе значение image
    if (file) {
      form.append('icon', file);
    } else {
      form.append('icon', formData.image);
    }
    const transformedCustomFields = formData.customFields.map(field => ({
      name: field.fieldName,
      type: field.fieldType,
      minSize: field.minSize ? Number(field.minSize) : 0,
      maxSize: field.maxSize ? Number(field.maxSize) : 0,
      icon: field.icon !== undefined ? field.icon : ""
    }));
    // Всегда передаем массив (даже если он пустой)
    form.append('customFields', JSON.stringify(transformedCustomFields));

    if (editingCategory) {
      await categoriesStore.updateCategory(editingCategory.id, form);
    } else {
      await categoriesStore.addCategory(form);
    }
    // После успешного сохранения сразу обновляем список категорий
    await categoriesStore.loadCategories();
    setIsDialogOpen(false);
  };

  // Обновление статуса блокировки через вызов специализированных методов стора
  const handleLockToggle = async (category: ICategory, lock: boolean) => {
    if (lock) {
      await categoriesStore.lockCategory(category.id);
    } else {
      await categoriesStore.unlockCategory(category.id);
    }
    // Обновляем список категорий после изменения статуса блокировки
    await categoriesStore.loadCategories();
  };

  // Обработчик удаления категории – сразу обновляем список после удаления
  const handleDeleteCategory = async (id: number) => {
    if (window.confirm("Вы действительно хотите удалить эту категорию?")) {
      await categoriesStore.removeCategory(id);
      await categoriesStore.loadCategories();
    }
  };

  // Обработчик изменения для file input
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const addCustomField = () => {
    setFormData((prev) => ({
      ...prev,
      customFields: [
        ...prev.customFields, 
        { fieldName: '', fieldType: 'string', minSize: '', maxSize: '', icon: '' }
      ],
    }));
  };

  const updateCustomField = (index: number, key: string, value: string) => {
    const updatedFields = formData.customFields.map((field, i) =>
      i === index ? { ...field, [key]: value } : field
    );
    setFormData((prev) => ({ ...prev, customFields: updatedFields }));
  };

  const removeCustomField = (index: number) => {
    const updatedFields = formData.customFields.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, customFields: updatedFields }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories Management</h2>
        <Button onClick={openAddDialog}>Add Category</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoriesStore.categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  {category.icon ? (
                    <img src={getImagePath(category.icon)} alt={category.name} className="h-6 w-6" />
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="flex items-center space-x-2">
                  {!category.isLocked ? (
                    <Button variant="outline" size="sm" onClick={() => handleLockToggle(category, true)}>
                      <Lock className="h-4 w-4 text-red-600" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleLockToggle(category, false)}>
                      <Unlock className="h-4 w-4 text-blue-600" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(category)}
                    disabled={category.isLocked}
                  >
                    <PenSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {categoriesStore.categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  No categories. Add a new category.
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
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Edit the category details'
                : 'Fill in the details for the new category'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category Name"
                required
              />
            </div>

            {/* Image Field */}
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="Image URL or leave blank if uploading file"
              />
              <Input type="file" onChange={handleFileChange} />
            </div>

            {/* Lock Editing */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="locked">Lock Editing</Label>
              <Switch
                id="locked"
                checked={formData.locked}
                onCheckedChange={(checked) => setFormData({ ...formData, locked: checked })}
              />
            </div>

            {/* Custom Fields */}
            <div>
              <h3 className="text-lg font-semibold">Custom Fields</h3>
              {formData.customFields.map((field, index) => (
                <div key={index} className="border p-2 rounded mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor={`fieldName-${index}`}>Field Name</Label>
                    <Input
                      id={`fieldName-${index}`}
                      value={field.fieldName}
                      onChange={(e) => updateCustomField(index, 'fieldName', e.target.value)}
                      placeholder="Field Name"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor={`fieldType-${index}`}>Field Type</Label>
                    <Select
                      value={field.fieldType}
                      onValueChange={(value) => updateCustomField(index, 'fieldType', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="int">Int</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor={`minSize-${index}`}>Min Size</Label>
                    <Input
                      id={`minSize-${index}`}
                      type="number"
                      value={field.minSize || ''}
                      onChange={(e) => updateCustomField(index, 'minSize', e.target.value)}
                      placeholder="Min Size"
                    />
                    <Label htmlFor={`maxSize-${index}`}>Max Size</Label>
                    <Input
                      id={`maxSize-${index}`}
                      type="number"
                      value={field.maxSize || ''}
                      onChange={(e) => updateCustomField(index, 'maxSize', e.target.value)}
                      placeholder="Max Size"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label htmlFor={`icon-${index}`}>Icon</Label>
                    <Input
                      id={`icon-${index}`}
                      value={field.icon}
                      onChange={(e) => updateCustomField(index, 'icon', e.target.value)}
                      placeholder="Icon (if empty, will be empty string)"
                    />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeCustomField(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addCustomField}>
                <Plus className="h-4 w-4 mr-1" /> Add Field
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default CategoriesTable;
