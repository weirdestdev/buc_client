import { $authHost, $host } from "./index";
import { jwtDecode } from "jwt-decode";
import { IUser } from "../store/UserStore"; // убедитесь, что путь корректный

export const registration = async (
  email: string, 
  password: string, 
  fullname: string, 
  phone: string, 
  purpose: string
): Promise<IUser> => {
    const { data } = await $host.post('api/user/registration', { email, password, fullname, phone, purpose });
    localStorage.setItem('token', data.token);
    return jwtDecode<IUser>(data.token);
}

export const login = async (
  email: string, 
  password: string
): Promise<IUser> => {
    const { data } = await $host.post('api/user/login', { email, password });
    localStorage.setItem('token', data.token);
    return jwtDecode<IUser>(data.token);
}

export const adminLogin = async (
  email: string, 
  password: string
): Promise<IUser> => {
    const { data } = await $host.post('api/user/adminLogin', { email, password });
    localStorage.setItem('admin-token', data.token);
    return jwtDecode<IUser>(data.token);
}

export const check = async () => {
    const {data} = await $authHost.get('/api/user/auth');
    localStorage.setItem('token', data.token);
    return jwtDecode<IUser>(data.token);
}