// store/RentTimeStore.ts
import { makeAutoObservable, runInAction } from "mobx";
import { 
  fetchRentTimes, 
  createRentTime, 
  updateRentTime, 
  deleteRentTime,
  createRental,
  updateRental,
  deleteRental,
  fetchRentals,
  fetchFeaturedRentals,
  fetchRentalsByCategory,
} from "../http/rentAPI";

export interface IRentTime {
  id: number;
  name: string;
}

export interface IRental {
  id: number;
  name: string;
  description: string;
  address: string;
  price: number;
  unit_of_numeration: string;
  status: string;
  featured: boolean;
  categoryId: number;
  rentTimeId: number;
  images: string[];
}

class RentTimeStore {
  rentTimes: IRentTime[] = [];
  rentals: IRental[] = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // Загрузка списка всех времен аренды
  async loadRentTimes() {
    this.isLoading = true;
    try {
      const data = await fetchRentTimes();
      runInAction(() => {
        this.rentTimes = data;
      });
    } catch (error) {
      console.error("Ошибка загрузки времен аренды:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Добавление нового времени аренды
  async addRentTime(rentTimeData: { name: string }) {
    this.isLoading = true;
    try {
      const newRentTime = await createRentTime(rentTimeData);
      runInAction(() => {
        this.rentTimes.push(newRentTime);
      });
    } catch (error) {
      console.error("Ошибка создания времени аренды:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Обновление времени аренды по ID
  async updateRentTime(id: number, rentTimeData: { name: string }) {
    this.isLoading = true;
    try {
      const updatedRentTime = await updateRentTime(id, rentTimeData);
      runInAction(() => {
        this.rentTimes = this.rentTimes.map(rt =>
          rt.id === id ? updatedRentTime : rt
        );
      });
    } catch (error) {
      console.error("Ошибка обновления времени аренды:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Удаление времени аренды по ID
  async removeRentTime(id: number) {
    this.isLoading = true;
    try {
      await deleteRentTime(id);
      runInAction(() => {
        this.rentTimes = this.rentTimes.filter(rt => rt.id !== id);
      });
    } catch (error) {
      console.error("Ошибка удаления времени аренды:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Загрузка всех объявлений
  async loadRentals() {
    this.isLoading = true;
    try {
      const data = await fetchRentals();
      runInAction(() => {
        this.rentals = data;
      });
    } catch (error) {
      console.error("Ошибка загрузки объявлений:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Создание нового объявления
  async addRental(rentalData: FormData) {
    this.isLoading = true;
    try {
      const newRental = await createRental(rentalData);
      runInAction(() => {
        this.rentals.push(newRental);
      });
    } catch (error) {
      console.error("Ошибка создания объявления:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Обновление объявления по ID
  async updateRental(id: number, rentalData: FormData) {
    this.isLoading = true;
    try {
      const updatedRental = await updateRental(id, rentalData);
      runInAction(() => {
        this.rentals = this.rentals.map(rental =>
          rental.id === id ? updatedRental : rental
        );
      });
    } catch (error) {
      console.error("Ошибка обновления объявления:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Удаление объявления по ID
  async removeRental(id: number) {
    this.isLoading = true;
    try {
      await deleteRental(id);
      runInAction(() => {
        this.rentals = this.rentals.filter(rental => rental.id !== id);
      });
    } catch (error) {
      console.error("Ошибка удаления объявления:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Загрузка избранных объявлений
  async loadFeaturedRentals() {
    this.isLoading = true;
    try {
      const data = await fetchFeaturedRentals();
      runInAction(() => {
        // В зависимости от логики приложения можно обновить весь список или хранить отдельно
        this.rentals = data;
      });
    } catch (error) {
      console.error("Ошибка загрузки избранных объявлений:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Загрузка объявлений по категории
  async loadRentalsByCategory(categoryId: number) {
    this.isLoading = true;
    try {
      const data = await fetchRentalsByCategory(categoryId);
      runInAction(() => {
        // Аналогично: можно сохранить отдельно или обновить общий список
        this.rentals = data;
      });
    } catch (error) {
      console.error("Ошибка загрузки объявлений по категории:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}

export default RentTimeStore;
