import axios from "axios";

// const API_BASE_URL =
//     import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// export const apiClient = axios.create({
//     baseURL: API_BASE_URL,
// });

// Temporarily hardcode the Railway URL to force the connection
const API_BASE_URL = "https://abiaariseserver-production.up.railway.app/api";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
});



// Add auth token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default apiClient;