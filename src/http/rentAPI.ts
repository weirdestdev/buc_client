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
