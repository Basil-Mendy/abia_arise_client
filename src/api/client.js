import axios from "axios";
import { getAPIBaseURL } from "../utils/apiConfig";

const API_BASE_URL = getAPIBaseURL();

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