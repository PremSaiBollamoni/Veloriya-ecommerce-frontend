import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, ChevronDown, ShoppingCart, Heart, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import { API_URL } from '../config';
import { formatCurrency } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface Category {
  _id: string;
  name: string;
}

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

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, state: wishlistState } = useWishlist();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);

        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/products?${params.toString()}`),
          axios.get(`${API_URL}/products/categories`)
        ]);

        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useEffect
  };

  const handleAddToCart = (product: Product) => {
    addToCart({ ...product, quantity: 1 });
  };

  const handleToggleWishlist = (productId: string) => {
    const isInWishlist = wishlistState.items.some(item => item._id === productId);
    if (isInWishlist) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const isItemInWishlist = (productId: string) => {
    return wishlistState.items.some(item => item._id === productId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
            All Products
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-md w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Category Dropdown */}
          <div className="lg:hidden w-full mb-4">
            <div className="relative">
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow text-gray-900 dark:text-white"
              >
                <span className="flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                  {selectedCategory || 'All Categories'}
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform ${isCategoryDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>
              
              {isCategoryDropdownOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm ${
                      selectedCategory === ''
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => {
                        setSelectedCategory(category.name);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm ${
                        selectedCategory === category.name
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Categories
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        selectedCategory === ''
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category._id}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                          selectedCategory === category.name
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              {/* View Toggle */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded-lg ${
                    view === 'grid'
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded-lg ${
                    view === 'list'
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Products */}
              <div className="p-4">
                {error && (
                  <div className="text-center py-8 text-error-600 dark:text-error-400">
                    {error}
                  </div>
                )}

                {isLoading ? (
                  <div className={`grid ${
                    view === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6'
                      : 'grid-cols-1 gap-4'
                  }`}>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div key={n} className="animate-pulse">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48 mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={view === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6'
                    : 'flex flex-col space-y-4'
                  }>
                    {products.map((product) => (
                      view === 'grid' ? (
                        <ProductCard key={product._id} product={product} />
                      ) : (
                        <div key={product._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            {/* Product Image */}
                            <div className="w-full sm:w-48 h-48 flex-shrink-0">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            
                            {/* Product Info */}
                            <div className="flex-1 flex flex-col">
                              <div className="flex-1">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                  {product.name}
                                </h3>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                  {product.description}
                                </p>
                                <div className="flex items-center mb-4">
                                  <div className="flex items-center text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < Math.floor(product.rating || 0)
                                            ? 'fill-current'
                                            : 'text-gray-300 dark:text-gray-600'
                                        }`}
                                      />
                                    ))}
                                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                      ({product.reviews?.length || 0} reviews)
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-1 sm:space-y-2">
                                  {product.features?.slice(0, 2).map((feature, index) => (
                                    <div key={index} className="flex items-center text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                      <span className="mr-2">•</span>
                                      <span>{feature}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Price and Actions */}
                              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex items-baseline">
                                  <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(product.price)}
                                  </span>
                                  {product.originalPrice && (
                                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                                      {formatCurrency(product.originalPrice)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleAddToCart(product)}
                                    disabled={!product.inStock}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                  >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                                  </button>
                                  <button
                                    onClick={() => handleToggleWishlist(product._id)}
                                    className="p-2 text-gray-400 hover:text-error-600 dark:hover:text-error-400 rounded-lg border border-gray-300 dark:border-gray-600"
                                  >
                                    <Heart className={`w-4 h-4 ${isItemInWishlist(product._id) ? 'fill-current text-error-600' : ''}`} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}

                {!isLoading && products.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No products found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
