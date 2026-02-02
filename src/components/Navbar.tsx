import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Sun, Moon, Heart, Bell } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { state: cartState } = useCart();
  const { state: wishlistState } = useWishlist();
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="font-poppins font-bold text-xl text-gray-900 dark:text-white">Veloriya</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            <Link 
              to="/" 
              className={`font-lato font-medium transition-all duration-200 hover:text-primary-600 dark:hover:text-primary-400 relative ${
                isActive('/') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Home
              {isActive('/') && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 rounded-full"></div>}
            </Link>
            <Link 
              to="/products" 
              className={`font-lato font-medium transition-all duration-200 hover:text-primary-600 dark:hover:text-primary-400 relative ${
                isActive('/products') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Products
              {isActive('/products') && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 rounded-full"></div>}
            </Link>
            <Link 
              to="/categories" 
              className={`font-lato font-medium transition-all duration-200 hover:text-primary-600 dark:hover:text-primary-400 relative ${
                isActive('/categories') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Categories
              {isActive('/categories') && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 rounded-full"></div>}
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist */}
            <Link 
              to="/wishlist" 
              onClick={() => setIsMenuOpen(false)}
              className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Heart className="w-5 h-5" />
              {wishlistState.items?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce-subtle font-bold">
                  {wishlistState.items.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link 
              to="/cart" 
              onClick={() => setIsMenuOpen(false)}
              className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartState.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce-subtle font-bold">
                  {cartState.itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary-200 dark:border-primary-700" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </button>
                {/* User dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-1">
                      <button onClick={() => handleNavigation('/profile')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        My Profile
                      </button>
                      <button onClick={() => handleNavigation('/orders')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        My Orders
                      </button>
                      <button onClick={() => handleNavigation('/wishlist')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Wishlist
                      </button>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-slide-in">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => handleNavigation('/')}
                className={`font-lato font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${
                  isActive('/') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => handleNavigation('/products')}
                className={`font-lato font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${
                  isActive('/products') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                Products
              </button>
              <button 
                onClick={() => handleNavigation('/categories')}
                className={`font-lato font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${
                  isActive('/categories') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                Categories
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
