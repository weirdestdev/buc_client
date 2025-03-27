import { makeAutoObservable, runInAction } from "mobx";
import { 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  lockCategory, 
  unlockCategory 
} from "../http/categoriesAPI";

export interface ICustomField {
  fieldName: string;
  fieldType: string;
  min_size?: number;
  max_size?: number;
  icon?: string | null;
}

export interface ICategory {
  id: number;
  name: string;
  icon: string;
  isLocked: boolean;
  customFields: ICustomField[];
}

class CategoriesStore {
  categories: ICategory[] = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // Загрузка списка категорий с сервера
  async loadCategories() {
    this.isLoading = true;
    try {
      const data = await fetchCategories();
      runInAction(() => {
        this.categories = data;
      });
    } catch (error) {
      console.error("Ошибка загрузки категорий:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Добавление новой категории
  async addCategory(categoryFormData: FormData) {
    this.isLoading = true;
    try {
      const newCategory = await createCategory(categoryFormData);
      runInAction(() => {
        this.categories.push(newCategory);
      });
    } catch (error) {
      console.error("Ошибка создания категории:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Обновление существующей категории
  async updateCategory(id: number, categoryFormData: FormData) {
    this.isLoading = true;
    try {
      const updatedCategory = await updateCategory(id, categoryFormData);
      runInAction(() => {
        this.categories = this.categories.map(cat =>
          cat.id === id ? updatedCategory : cat
        );
      });
    } catch (error) {
      console.error("Ошибка обновления категории:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Удаление категории
  async removeCategory(id: number) {
    this.isLoading = true;
    try {
      await deleteCategory(id);
      runInAction(() => {
        this.categories = this.categories.filter(cat => cat.id !== id);
      });
    } catch (error) {
      console.error("Ошибка удаления категории:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Блокировка категории (isLocked = true)
  async lockCategory(id: number) {
    this.isLoading = true;
    try {
      const res = await lockCategory(id);
      runInAction(() => {
        this.categories = this.categories.map(cat => 
          cat.id === id ? { ...cat, isLocked: true } : cat
        );
      });
    } catch (error) {
      console.error("Ошибка блокировки категории:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Разблокировка категории (isLocked = false)
  async unlockCategory(id: number) {
    this.isLoading = true;
    try {
      const res = await unlockCategory(id);
      runInAction(() => {
        this.categories = this.categories.map(cat => 
          cat.id === id ? { ...cat, isLocked: false } : cat
        );
      });
    } catch (error) {
      console.error("Ошибка разблокировки категории:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}

export default CategoriesStore;
