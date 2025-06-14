import axios from 'axios';
import { API_URL } from '../config';

// Helper function to ensure correct API URL format
const getApiUrl = (endpoint: string) => {
  const baseUrl = API_URL.endsWith('/api') ? API_URL : API_URL.endsWith('/') ? `${API_URL}api` : `${API_URL}/api`;
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

interface ProfileUpdateData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  phone?: string;
  address?: string;
}

export const updateUserProfile = async (data: ProfileUpdateData, token: string) => {
  try {
    // Remove undefined fields to avoid sending them to the server
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== '')
    );

    console.log('Updating profile with data:', { 
      ...cleanData, 
      currentPassword: cleanData.currentPassword ? '[REDACTED]' : undefined,
      newPassword: cleanData.newPassword ? '[REDACTED]' : undefined
    });
    
    const response = await axios.put(
      getApiUrl('/users/profile'),
      cleanData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Profile update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Profile update error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to update profile';
      console.error('Server error details:', error.response?.data);
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred while updating profile');
  }
};

export const getUserProfile = async (token: string) => {
  try {
    const response = await axios.get(
      getApiUrl('/users/profile'),
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
    throw error;
  }
}; 