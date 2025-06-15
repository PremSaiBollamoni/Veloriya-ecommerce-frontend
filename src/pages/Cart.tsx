import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';

const Cart: React.FC = () => {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleUpdateQuantity = (_id: string, quantity: number) => {
    if (quantity > 0) {
      updateQuantity(_id, quantity);
    }
  };

  const handleRemoveItem = (_id: string) => {
    removeFromCart(_id);
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="font-poppins text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Your cart is empty
            </h2>
            <p className="font-lato text-gray-600 dark:text-gray-400 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-nunito font-semibold rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-poppins text-3xl font-bold text-gray-900 dark:text-white">
              Shopping Cart
            </h1>
            <p className="font-lato text-gray-600 dark:text-gray-400 mt-1">
              {state.itemCount} {state.itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          
          <button
            onClick={clearCart}
            className="text-error-500 hover:text-error-600 font-lato font-semibold transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-3 space-y-4">
            {state.items.map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-poppins font-semibold text-gray-900 dark:text-white text-lg">
                      {item.name}
                    </h3>
                    <p className="font-lato text-gray-600 dark:text-gray-400 mt-1">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>

                  {/* Quantity Controls & Total - Stacked on mobile */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="font-nunito font-semibold text-gray-900 dark:text-white min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                      <p className="font-poppins font-bold text-gray-900 dark:text-white text-lg">
                        {formatCurrency(item.price * item.quantity)}
                      </p>

                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        className="text-error-500 hover:text-error-600 p-2 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:sticky lg:top-8">
              <h2 className="font-poppins text-xl font-bold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div key="subtotal" className="flex justify-between font-lato text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({state.itemCount} items)</span>
                  <span>{formatCurrency(state.total)}</span>
                </div>
                
                <div key="shipping" className="flex justify-between font-lato text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="text-success-600 dark:text-success-400">Free</span>
                </div>
                
                <div key="tax" className="flex justify-between font-lato text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span>{formatCurrency(state.total * 0.08)}</span>
                </div>
                
                <div key="total" className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="font-poppins font-bold text-gray-900 dark:text-white text-lg">
                      Total
                    </span>
                    <span className="font-poppins font-bold text-gray-900 dark:text-white text-lg">
                      {formatCurrency(state.total + state.total * 0.08)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  to="/checkout"
                  className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-nunito font-semibold rounded-lg transition-colors text-center block"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  to="/products"
                  className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 font-nunito font-semibold rounded-lg transition-colors text-center block"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
