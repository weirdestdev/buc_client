// store/DocsStore.ts
import { makeAutoObservable } from "mobx";
import { uploadDoc } from "../http/docsAPI";

interface IDoc {
  id: number;
  docType: "terms" | "privacy" | "cookie";
  path: string;
}

class DocsStore {
  // Храним загруженные документы по типу
  docs: Record<string, IDoc | null> = {
    terms: null,
    privacy: null,
    cookie: null,
  };

  constructor() {
    makeAutoObservable(this);
  }

  // Метод для загрузки документа
  async uploadDocument(docType: "terms" | "privacy" | "cookie", file: File) {
    try {
      const data = await uploadDoc(docType, file);
      this.docs[docType] = data.doc; // Предполагается, что API возвращает поле doc
      return data;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  }
}

export default DocsStore;
