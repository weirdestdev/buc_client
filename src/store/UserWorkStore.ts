import { makeAutoObservable, runInAction } from "mobx";
import { getUsersWithPagination, getAllUsersCount, getPendingUsersCount, getApprovedUsersCount, getBlockedUsersCount } from "../http/userWorkAPI";

class UserWorkStore {
  total = 0;
  pending = 0;
  approved = 0;
  blocked = 0;
  users = [];
  currentPage = 1;
  totalPages = 1;
  isLoading = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // Загрузка статистики пользователей
  fetchUserCounts() {
    getAllUsersCount()
      .then((total) => {
        runInAction(() => {
          this.total = total;
        });
      })
      .catch((error) => console.error("Ошибка загрузки общего количества пользователей:", error));

    getPendingUsersCount()
      .then((pending) => {
        runInAction(() => {
          this.pending = pending;
        });
      })
      .catch((error) => console.error("Ошибка загрузки пользователей со статусом pending:", error));

    getApprovedUsersCount()
      .then((approved) => {
        runInAction(() => {
          this.approved = approved;
        });
      })
      .catch((error) => console.error("Ошибка загрузки пользователей со статусом approved:", error));

    getBlockedUsersCount()
      .then((blocked) => {
        runInAction(() => {
          this.blocked = blocked;
        });
      })
      .catch((error) => console.error("Ошибка загрузки пользователей со статусом blocked:", error));
  }

  // Загрузка пользователей с пагинацией
  fetchUsers(page = 1, limit = 10, searchQuery, category) {
    this.isLoading = true;
    getUsersWithPagination(page, limit, searchQuery, category)
      .then((data) => {
        runInAction(() => {
          this.users = data.users;
          this.totalPages = Math.ceil(data.totalCount / limit);
          this.currentPage = page;
        });
      })
      .catch((error) => {
        console.error("Ошибка загрузки пользователей:", error);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  // Обновление страницы пагинации
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.fetchUsers(page, 10, '', 'all');
    }
  }
}

export default UserWorkStore;
