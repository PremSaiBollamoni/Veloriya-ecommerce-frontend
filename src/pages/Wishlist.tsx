import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';

const Wishlist: React.FC = () => {
  const { state: wishlistState, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (product: any) => {
    await addToCart({
      ...product,
      price: Number(product.price),
      quantity: 1
    });
    await removeFromWishlist(product._id);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Heart className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Sign in to view your wishlist</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Please{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-500">
                sign in
              </Link>{' '}
              to access your wishlist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistState.loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistState.error) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-error-600 dark:text-error-400">
            <p>{wishlistState.error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistState.items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Heart className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Your wishlist is empty</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Start adding items to your wishlist by browsing our{' '}
              <Link to="/products" className="text-primary-600 hover:text-primary-500">
                products
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
          <button
            onClick={() => clearWishlist()}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Wishlist</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistState.items.map((product) => (
            <div
              key={product._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group"
            >
              <Link to={`/product/${product._id}`} className="block relative aspect-w-1 aspect-h-1">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                />
              </Link>
              <div className="p-4">
                <Link
                  to={`/product/${product._id}`}
                  className="text-lg font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-1"
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-lg font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(product.price)}
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="p-2 text-gray-400 hover:text-error-600 dark:hover:text-error-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist; 