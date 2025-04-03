import { makeAutoObservable } from "mobx";
import { createMemberRequest, getMemberRequests, updateMemberRequest } from "../http/memberRequestAPI";

export interface IMemberRequest {
  id: number;
  memberName: string;
  email: string;
  message: string;
  status: "new" | "viewed" | "completed";
  createdAt: string;
}

class MemberRequestsStore {
  // Храним массив запросов пользователей
  requests: IMemberRequest[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  // Метод для получения всех запросов
  async fetchRequests() {
    try {
      const data = await getMemberRequests();
      // Предполагается, что API возвращает объект вида { requests: IMemberRequest[] }
      this.requests = data.requests;
    } catch (error) {
      console.error("Error fetching member requests:", error);
    }
  }

  // Метод для создания нового запроса
  async addRequest(memberName: string, email: string, message: string) {
    try {
      const data = await createMemberRequest(memberName, email, message);
      // Добавляем новый запрос в начало списка
      this.requests.unshift(data.request);
      return data;
    } catch (error) {
      console.error("Error creating member request:", error);
      throw error;
    }
  }

  // Метод для обновления статуса запроса
  async changeRequestStatus(id: number, status: "new" | "viewed" | "completed") {
    try {
      await updateMemberRequest(id, status);
      // Обновляем состояние запроса в сторе
      this.requests = this.requests.map((req) =>
        req.id === id ? { ...req, status } : req
      );
    } catch (error) {
      console.error("Error updating member request:", error);
      throw error;
    }
  }
}

export default MemberRequestsStore;
