// http/docsAPI.ts
import { $authHost } from "./index";

// Функция для загрузки документа
export const uploadDoc = async (docType: string, file: File) => {
  const formData = new FormData();
  formData.append("docType", docType);
  formData.append("file", file);

  const { data } = await $authHost.post("api/docs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Функция для получения документа
export const getDoc = async (docType: string) => {
  const { data } = await $authHost.get("api/docs", { params: { docType } });
  return data;
};
