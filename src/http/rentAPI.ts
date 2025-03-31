// http/rentAPI.ts
import { $authHost } from "./index";

// Получение всех записей времени аренды
export const fetchRentTimes = async () => {
  const { data } = await $authHost.get('api/rentals/renttime');
  return data;
};

// Создание новой записи времени аренды
export const createRentTime = async (rentTimeData: { name: string }) => {
  const { data } = await $authHost.post('api/rentals/renttime', rentTimeData);
  return data;
};

// Обновление записи времени аренды по ID
export const updateRentTime = async (id: number, rentTimeData: { name: string }) => {
  const { data } = await $authHost.put(`api/rentals/renttime/${id}`, rentTimeData);
  return data;
};

// Удаление записи времени аренды по ID
export const deleteRentTime = async (id: number) => {
  const { data } = await $authHost.delete(`api/rentals/renttime/${id}`);
  return data;
};

// Создание нового объявления (с загрузкой файлов)
export const createRental = async (rentalData: FormData) => {
  const { data } = await $authHost.post('api/rentals', rentalData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// Обновление объявления по ID (с загрузкой файлов)
export const updateRental = async (id: number, rentalData: FormData) => {
  const { data } = await $authHost.put(`api/rentals/${id}`, rentalData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// Удаление объявления по ID
export const deleteRental = async (id: number) => {
  const { data } = await $authHost.delete(`api/rentals/${id}`);
  return data;
};

// Получение всех объявлений
export const fetchRentals = async () => {
  const { data } = await $authHost.get('api/rentals');
  return data;
};

// Получение избранных объявлений
export const fetchFeaturedRentals = async () => {
  const { data } = await $authHost.get('api/rentals/featured');
  return data;
};

// Получение объявлений по статусу
export const fetchStatusRentals = async (status) => {
  const { data } = await $authHost.get(`api/rentals/status/${status}`);
  return data;
};

// Получение объявлений по категории
export const fetchRentalsByCategory = async (categoryId: number) => {
  const { data } = await $authHost.get(`api/rentals/category/${categoryId}`);
  return data;
};