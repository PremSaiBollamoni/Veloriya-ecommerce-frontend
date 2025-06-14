import axios from 'axios';
import { API_URL } from '../config';

export const initializeAdmin = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/init-admin`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      // Admin already exists - this is expected
      return { message: 'Admin already exists' };
    }
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const validateToken = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (email: string, password: string, name: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      name
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Registration failed');
    }
    throw error;
  }
}; 