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

export interface IAdmin extends Omit<IUser, 'purpose'> {

}

export default class UserStore {
  private _isAuth: boolean;
  private _isAuthAdmin: boolean;
  private _user: IUser | null;
  private _admin: IAdmin | null; // Добавляем свойство для админа

  constructor() {
    this._isAuth = false;
    this._isAuthAdmin = false;
    this._user = null;
    this._admin = null;
    makeAutoObservable(this);
  }

  // Геттеры и сеттеры для обычного пользователя
  setIsAuth(bool: boolean): void {
    this._isAuth = bool;
  }

  setIsAuthAdmin(bool: boolean): void {
    this._isAuthAdmin = bool;
  }

  setUser(user: IUser): void {
    this._user = user;
  }

  get isAuth(): boolean {
    return this._isAuth;
  }

  get user(): IUser | null {
    return this._user;
  }

  // Методы для админа
  setAdmin(admin: IAdmin): void {
    this._admin = admin;
  }

  get admin(): IAdmin | null {
    return this._admin;
  }

  get isAuthAdmin(): boolean {
    return this._isAuthAdmin;
  }

  async loginUser(email: string, password: string): Promise<void> {
    const decodedUser = await login(email, password);
    this.setIsAuth(true);
    this.setUser(decodedUser);
  }

  async loginAdmin(email: string, password: string): Promise<void> {
    const decodedAdmin = await adminLogin(email, password);
    this.setIsAuthAdmin(true);
    this.setAdmin(decodedAdmin);
  }

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
    localStorage.removeItem('token');
    localStorage.removeItem('admin-token');
    this.setUser(null);
    this.setAdmin(null);
    this.setIsAuth(false);
  }
}
