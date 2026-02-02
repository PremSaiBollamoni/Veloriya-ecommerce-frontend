import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { _id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  state: CartState;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const loadCartFromStorage = (): CartState => {
  try {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : {
      items: [],
      itemCount: 0,
      total: 0
    };
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return {
      items: [],
      itemCount: 0,
      total: 0
    };
  }
};

const saveCartToStorage = (cart: CartState) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newState: CartState;
  
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item._id === action.payload._id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item._id === action.payload._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        const newTotal = state.total + Number(existingItem.price);
        newState = {
          ...state,
          items: updatedItems,
          itemCount: state.itemCount + 1,
          total: Number(newTotal.toFixed(2))
        };
      } else {
        newState = {
          ...state,
          items: [...state.items, { ...action.payload, price: Number(action.payload.price) }],
          itemCount: state.itemCount + 1,
          total: Number((state.total + Number(action.payload.price)).toFixed(2))
        };
      }
      break;
    }

    case 'REMOVE_ITEM': {
      const itemToRemove = state.items.find(item => item._id === action.payload);
      if (!itemToRemove) return state;

      const newTotal = state.total - (Number(itemToRemove.price) * itemToRemove.quantity);
      newState = {
        ...state,
        items: state.items.filter(item => item._id !== action.payload),
        itemCount: state.itemCount - itemToRemove.quantity,
        total: Number(newTotal.toFixed(2))
      };
      break;
    }

    case 'UPDATE_QUANTITY': {
      const item = state.items.find(item => item._id === action.payload._id);
      if (!item) return state;

      const quantityDiff = action.payload.quantity - item.quantity;
      const updatedItems = state.items.map(item =>
        item._id === action.payload._id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      const newTotal = state.total + (Number(item.price) * quantityDiff);
      newState = {
        ...state,
        items: updatedItems,
        itemCount: state.itemCount + quantityDiff,
        total: Number(newTotal.toFixed(2))
      };
      break;
    }

    case 'CLEAR_CART':
      newState = {
        items: [],
        itemCount: 0,
        total: 0
      };
      break;

    default:
      newState = state;
  }
  
  saveCartToStorage(newState);
  return newState;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, null, loadCartFromStorage);

  const addToCart = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { _id: id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ state, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};