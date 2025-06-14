import axios from 'axios';
import { API_URL } from '../config';

export const initializeAdmin = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/init-admin`, {
      name: 'Admin',
      email: 'veloriya@va.in',
      password: 'Admin@Veloriya',
      isAdmin: true
    });
    return response.data;
  } catch (error) {
    console.error('Error initializing admin:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Ensure email is properly formatted
    const normalizedEmail = email.toLowerCase().trim();
    
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: normalizedEmail,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.data || !response.data.token) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
    throw error;
  }
};

export const loginAdmin = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/admin/login`, {
      email: email.toLowerCase(),
      password
    });
    return response.data;
  } catch (error) {
    console.error('Admin login error:', error);
    throw error;
  }
}; 