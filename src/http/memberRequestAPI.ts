import { $authHost } from "./index";

// Функция для создания нового запроса пользователя
export const createMemberRequest = async (
  memberName: string,
  email: string,
  message: string
) => {
  const { data } = await $authHost.post("api/member-requests", { memberName, email, message });
  return data;
};

// Функция для получения списка запросов пользователей
export const getMemberRequests = async () => {
  const { data } = await $authHost.get("api/member-requests");
  return data;
};

// Функция для обновления запроса пользователя (например, изменение статуса)
export const updateMemberRequest = async (
  id: number,
  status: "new" | "viewed" | "completed"
) => {
  const { data } = await $authHost.put(`api/member-requests/${id}`, { status });
  return data;
};
