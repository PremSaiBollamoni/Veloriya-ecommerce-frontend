import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Truck, Headphones, Award, Users, Zap } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { API_URL } from '../config';

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
  featured: boolean;
}

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products?featured=true`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setFeaturedProducts(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100",
      rating: 5,
      text: "Amazing quality products and fast shipping. Veloriya has become my go-to store for everything!"
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100",
      rating: 5,
      text: "The customer service is exceptional. They helped me find exactly what I was looking for."
    },
    {
      id: 3,
      name: "Emily Davis",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100",
      rating: 5,
      text: "Love the variety and quality. The AI assistant is incredibly helpful for product recommendations."
    }
  ];

  const stats = [
    { icon: Users, value: "50K+", label: "Happy Customers" },
    { icon: Award, value: "99.9%", label: "Satisfaction Rate" },
    { icon: Truck, value: "24h", label: "Fast Delivery" },
    { icon: Zap, value: "1M+", label: "Products Sold" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] sm:h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600">
          <img
            src="https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-4">
          <div className="animate-fade-in">
            <h1 className="font-poppins text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6 leading-tight">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-warning-400 to-accent-300">
                Veloriya
              </span>
            </h1>
            <p className="font-lato text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6 sm:mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Discover premium products that elevate your lifestyle with our curated collection of excellence
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-bounce-subtle">
            <Link
              to="/products"
              className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 font-nunito font-bold rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              Shop Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/products"
              className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-nunito font-bold rounded-full hover:bg-white hover:text-primary-600 transition-all duration-300 hover:scale-105"
            >
              Browse Categories
              <Star className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mt-12 sm:mt-16 animate-slide-in">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="font-poppins text-xl sm:text-2xl md:text-3xl font-bold">{stat.value}</div>
                <div className="font-lato text-xs sm:text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Veloriya?
            </h2>
            <p className="font-lato text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Experience the difference with our premium service and quality guarantee
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:shadow-xl transition-shadow">
                <Truck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="font-poppins font-bold text-lg sm:text-xl text-gray-900 dark:text-white mb-2 sm:mb-3">Free Shipping</h3>
              <p className="font-lato text-sm sm:text-base text-gray-600 dark:text-gray-400">Free shipping on orders over $50 with express delivery options</p>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:shadow-xl transition-shadow">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="font-poppins font-bold text-lg sm:text-xl text-gray-900 dark:text-white mb-2 sm:mb-3">Secure Payment</h3>
              <p className="font-lato text-sm sm:text-base text-gray-600 dark:text-gray-400">100% secure payment processing with bank-level encryption</p>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:shadow-xl transition-shadow">
                <Star className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="font-poppins font-bold text-lg sm:text-xl text-gray-900 dark:text-white mb-2 sm:mb-3">Quality Products</h3>
              <p className="font-lato text-sm sm:text-base text-gray-600 dark:text-gray-400">Curated selection of premium items with quality guarantee</p>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:shadow-xl transition-shadow">
                <Headphones className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="font-poppins font-bold text-lg sm:text-xl text-gray-900 dark:text-white mb-2 sm:mb-3">24/7 Support</h3>
              <p className="font-lato text-sm sm:text-base text-gray-600 dark:text-gray-400">Round-the-clock customer service with AI-powered assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Products
            </h2>
            <p className="font-lato text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover our hand-picked selection of premium products that our customers love
            </p>
          </div>

          <div className="flex justify-between items-center mb-8">
            <Link
              to="/products"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {error && (
            <div className="text-error-600 dark:text-error-400 text-center py-8">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Customers Say
            </h2>
            <p className="font-lato text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust Veloriya for their shopping needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-poppins font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-warning-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="font-lato text-sm sm:text-base text-gray-600 dark:text-gray-400 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated with Veloriya
          </h2>
          <p className="font-lato text-lg sm:text-xl text-primary-100 mb-6 sm:mb-8">
            Subscribe to our newsletter for exclusive deals, new arrivals, and insider tips
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-full font-lato text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
            />
            <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 font-nunito font-bold rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
              Subscribe Now
            </button>
          </div>
          <p className="text-primary-200 text-xs sm:text-sm mt-4">
            Join 50,000+ subscribers and never miss a deal!
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
