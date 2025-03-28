// store/RentTimeStore.ts
import { makeAutoObservable, runInAction } from "mobx";
import { 
  fetchRentTimes, 
  createRentTime, 
  updateRentTime, 
  deleteRentTime 
} from "../http/rentAPI";

export interface IRentTime {
  id: number;
  name: string;
}

class RentTimeStore {
  rentTimes: IRentTime[] = [];
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
}

export default RentTimeStore;
