import { makeAutoObservable } from "mobx";
import { registration, login, adminLogin } from "../http/userAPI";

// Интерфейс для данных пользователя, получаемых из токена
export interface IUser {
  id: number;
  email: string;
  fullname: string;
  phone: string;
  purpose: string;
  status: string;
  role: string;
  iat: number; // время создания токена
  exp: number; // время истечения токена
}

export default class UserStore {
  private _isAuth: boolean;
  private _user: IUser | null;

  constructor() {
    this._isAuth = false;
    this._user = null;
    makeAutoObservable(this);
  }

  // Метод для установки флага авторизации
  setIsAuth(bool: boolean): void {
    this._isAuth = bool;
  }

  // Метод для сохранения данных пользователя
  setUser(user: IUser): void {
    this._user = user;
  }

  // Геттер для флага авторизации
  get isAuth(): boolean {
    return this._isAuth;
  }

  // Геттер для данных пользователя
  get user(): IUser | null {
    return this._user;
  }

  /**
   * Выполняет авторизацию пользователя.
   * Вызывает API для входа, сохраняет токен в localStorage,
   * обновляет состояние стора и получает данные пользователя из токена.
   */
  async loginUser(email: string, password: string): Promise<void> {
    const decodedUser = await login(email, password);
    this.setIsAuth(true);
    this.setUser(decodedUser);
  }

  async loginAdmin(email: string, password: string): Promise<void> {
    const decodedUser = await adminLogin(email, password);

    if(this.user === null) {
      this.setIsAuth(true);
      this.setUser(decodedUser);
    }
  }

  /**
   * Выполняет регистрацию пользователя.
   * Вызывает API для регистрации, сохраняет токен в localStorage,
   * обновляет состояние стора и получает данные пользователя из токена.
   */
  async registerUser(
    email: string,
    password: string,
    fullname: string,
    phone: string,
    purpose: string
  ): Promise<void> {
    const decodedUser = await registration(email, password, fullname, phone, purpose);
    this.setIsAuth(true);
    this.setUser(decodedUser);
  }

  logout(): void {
    localStorage.removeItem('token'); // удаляем токен из localStorage
    this.setUser(null);               // очищаем данные пользователя
    this.setIsAuth(false);            // сбрасываем флаг авторизации
  }
}
