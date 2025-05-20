// http.ts
import axios, { type InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_SERVER_URL;

const $host = axios.create({ baseURL });
const $authHost = axios.create({ baseURL });

const authInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  console.log(token);
  if (token) {
    // Гарантируем, что headers существует
    if (!config.headers) {
      config.headers = {} as any;
    }
    // Мутируем его, приводя к 'any' или к 'AxiosRequestHeaders'
    (config.headers as any).Authorization = `Bearer ${token}`;
    // — или так:
    // const hdrs = config.headers as AxiosRequestHeaders;
    // hdrs['Authorization'] = `Bearer ${token}`;
  }
  return config;
};

$authHost.interceptors.request.use(authInterceptor);

export {
  $host,
  $authHost
}