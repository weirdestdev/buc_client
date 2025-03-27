import { $authHost } from "./index";

// Получение всех категорий
export const fetchCategories = async () => {
  const { data } = await $authHost.get('api/categories');
  return data;
};

// Создание новой категории с передачей FormData (включая имя, иконку, customFields)
export const createCategory = async (categoryData: FormData) => {
  const { data } = await $authHost.post('api/categories/create', categoryData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// Обновление существующей категории с передачей FormData (имя, иконка, customFields)
export const updateCategory = async (id: number, categoryData: FormData) => {
  const { data } = await $authHost.put(`api/categories/${id}`, categoryData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// Удаление категории по id
export const deleteCategory = async (id: number) => {
  const { data } = await $authHost.delete(`api/categories/${id}`);
  return data;
};

// Блокировка категории (установка isLocked = true)
export const lockCategory = async (id: number) => {
  const { data } = await $authHost.patch(`api/categories/${id}/lock`);
  return data;
};

// Разблокировка категории (установка isLocked = false)
export const unlockCategory = async (id: number) => {
  const { data } = await $authHost.patch(`api/categories/${id}/unlock`);
  return data;
};
