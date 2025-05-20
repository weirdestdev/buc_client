import axios from 'axios';

const $host = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL
});

const $authHost = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL
});

const authInterceptor = config => {
  const token = localStorage.getItem('admin-token') || localStorage.getItem('token');
  console.log(token);
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
};


$authHost.interceptors.request.use(authInterceptor);

export {
  $host,
  $authHost
}