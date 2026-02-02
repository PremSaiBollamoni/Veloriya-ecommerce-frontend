import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  category: string;
  features: string[];
  rating: number;
  reviews: any[];
  inStock: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { state: wishlistState, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const isInWishlist = wishlistState.items.some(item => item._id === product._id);

  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  const handleWishlistClick = async () => {
    if (!isAuthenticated) {
      // Redirect to login page
      window.location.href = '/login';
      return;
    }

    if (isInWishlist) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <Link to={`/products/${product._id}`} className="block relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 sm:h-56 object-cover"
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-error-500 text-white text-xs font-bold px-2 py-1 rounded">
            {discount}% OFF
          </div>
        )}
        {!product.inStock && (
          <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
            Out of Stock
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/products/${product._id}`} className="block flex-grow">
          <h3 className="font-nunito font-bold text-gray-900 dark:text-white mb-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center mb-2">
          <div className="flex items-center text-yellow-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm font-lato text-gray-600 dark:text-gray-400">
              {product.rating.toFixed(1)}
            </span>
          </div>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-sm font-lato text-gray-600 dark:text-gray-400">
            {product.reviews.length} reviews
          </span>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleWishlistClick}
              className={`flex items-center justify-center p-2 rounded-full transition-colors ${
                isInWishlist
                  ? 'text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-300 bg-error-50 dark:bg-error-900/20'
                  : 'text-gray-400 dark:text-gray-500 hover:text-error-600 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20'
              }`}
              title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex-1 ml-2 flex items-center justify-center px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
              title={product.inStock ? 'Add to Cart' : 'Out of Stock'}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              <span className="font-medium">Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
