import axios from 'axios';

const $host = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL
});

const $authHost = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL
});

const authInterceptor = config => {
    // Если admin-token есть, используем его, иначе обычный token
    const adminToken = localStorage.getItem('admin-token');
    const userToken = localStorage.getItem('token');
    const token = adminToken || userToken;
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  };
  

$authHost.interceptors.request.use(authInterceptor);

export {
    $host,
    $authHost
}