import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ArrowLeft, Truck, Shield, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { API_URL } from '../config';
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

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching product with ID:', id);
        console.log('API URL:', `${API_URL}/products/${id}`);
        
        const response = await axios.get(`${API_URL}/products/${id}`);
        console.log('Product data received:', response.data);
        
        if (!response.data) {
          throw new Error('No product data received');
        }
        
        setProduct(response.data);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load product');
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error || 'Product not found'}
            </h2>
            <Link
              to="/products"
              className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            to="/products"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Products
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full aspect-square">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {product.name}
              </h1>

              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    ({product.reviews.length} reviews)
                  </span>
                </div>
              </div>

              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="ml-2 text-lg text-gray-500 dark:text-gray-400 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                    <span className="ml-2 text-sm font-medium text-error-600 dark:text-error-400">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {product.description}
              </p>

              {/* Features */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 text-primary-600 dark:text-primary-400">•</span>
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Add to Cart */}
              <div className="flex items-center space-x-4 mb-8">
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-gray-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>

                <button className="p-4 text-gray-400 hover:text-error-600 dark:hover:text-error-400 rounded-lg border border-gray-300 dark:border-gray-600">
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              {/* Shipping Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start">
                    <Truck className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Free Shipping</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">On orders over $50</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">2 Year Warranty</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Full coverage</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <RotateCcw className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">30 Days Return</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Money back guarantee</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;