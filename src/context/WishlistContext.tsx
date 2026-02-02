import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  image: string;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
}

interface WishlistContextType {
  state: WishlistState;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null
};

type WishlistAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_ITEMS'; payload: WishlistItem[] }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_ITEMS':
      return { ...state, items: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { isAuthenticated, token } = useAuth();

  // Configure axios with auth token - remove /api from baseURL
  const axiosWithAuth = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    withCredentials: true
  });

  // Fetch wishlist on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchWishlist();
    } else {
      dispatch({ type: 'SET_ITEMS', payload: [] });
    }
  }, [isAuthenticated, token]);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch wishlist');
      const data = await response.json();
      dispatch({ type: 'SET_ITEMS', payload: data.items || [] });
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: err instanceof Error ? err.message : 'Failed to fetch wishlist' 
      });
    }
  };

  const addToWishlist = async (productId: string) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const response = await axiosWithAuth.post(`/wishlist/add/${productId}`);
      if (response.data && Array.isArray(response.data.products)) {
        dispatch({ type: 'SET_ITEMS', payload: response.data.products });
      }
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to add item to wishlist' 
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const response = await axiosWithAuth.delete(`/wishlist/remove/${productId}`);
      if (response.data && Array.isArray(response.data.products)) {
        dispatch({ type: 'SET_ITEMS', payload: response.data.products });
      }
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to remove item from wishlist' 
      });
    }
  };

  const clearWishlist = async () => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const response = await axiosWithAuth.delete('/wishlist/clear');
      if (response.data) {
        dispatch({ type: 'SET_ITEMS', payload: [] });
      }
    } catch (error: any) {
      console.error('Error clearing wishlist:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to clear wishlist' 
      });
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        state,
        addToWishlist,
        removeFromWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}; 