import axios from 'axios';

// Dynamically use the environment variable if deployed, otherwise fall back to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/auth/';

export const register = async (username, email, password, role) => {
    return await axios.post(API_URL + 'register', {
        username,
        email,
        password,
        role
    });
};

export const login = async (email, password) => {
    const response = await axios.post(API_URL + 'login', {
        email,
        password
    });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('user');
};

export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

export const forgotPassword = async (email) => {
    const response = await axios.post(API_URL + `forgot-password?email=${email}`);
    return response.data;
};

export const resetPassword = async (token, newPassword) => {
    const response = await axios.post(API_URL + `reset-password?token=${token}&newPassword=${newPassword}`);
    return response.data;
};