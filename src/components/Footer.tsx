import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Github, Linkedin } from 'lucide-react';

const Contact_Info = {
  title: "Contact Info",
  items: [
    {
      icon: "📧",
      text: "prem.0820.04@gmail.com",
      link: "mailto:prem.0820.04@gmail.com"
    },
    {
      icon: "📞",
      text: "+91 8074850696",
      link: "tel:+918074850696"
    },
    {
      icon: "📍",
      text: "Kurnool, Andhra Pradesh, India",
      link: "https://maps.google.com/?q=Kurnool,Andhra+Pradesh,India"
    }
  ]
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-poppins font-bold text-xl">Veloriya</span>
            </div>
            <p className="text-gray-400 font-lato mb-4 text-sm sm:text-base">
              Your premium destination for quality products and exceptional shopping experience.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/premmmmm_04?igsh=NHQ0MmdkZWdjNHMx" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-primary-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://github.com/PremSaiBollamoni" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-primary-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/prem-sai-bollamoni-817a18348" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-primary-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-poppins font-semibold text-lg mb-2 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3 font-lato">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors block text-sm sm:text-base">Home</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-white transition-colors block text-sm sm:text-base">Products</Link></li>
              <li><Link to="/categories" className="text-gray-400 hover:text-white transition-colors block text-sm sm:text-base">Categories</Link></li>
              <li><Link to="/cart" className="text-gray-400 hover:text-white transition-colors block text-sm sm:text-base">Cart</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-poppins font-semibold text-lg mb-2 sm:mb-4">Customer Service</h3>
            <ul className="space-y-2 sm:space-y-3 font-lato">
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors block text-sm sm:text-base">Contact Us</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors block text-sm sm:text-base">FAQ</Link></li>
              <li><Link to="/shipping" className="text-gray-400 hover:text-white transition-colors block text-sm sm:text-base">Shipping Info</Link></li>
              <li><Link to="/returns" className="text-gray-400 hover:text-white transition-colors block text-sm sm:text-base">Returns</Link></li>
              <li><Link to="/size-guide" className="text-gray-400 hover:text-white transition-colors block text-sm sm:text-base">Size Guide</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-poppins font-semibold text-lg mb-2 sm:mb-4">Contact Info</h3>
            <div className="space-y-3 font-lato">
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:prem.0820.04@gmail.com" className="hover:text-white transition-colors text-sm sm:text-base break-all">
                  prem.0820.04@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+918074850696" className="hover:text-white transition-colors text-sm sm:text-base">
                  +91 8074850696 / +91 7981698255
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <a href="https://maps.google.com/?q=Kurnool,Andhra+Pradesh,India" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="hover:text-white transition-colors text-sm sm:text-base">
                  Kurnool, Andhra Pradesh, India
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex flex-col items-center sm:items-start space-y-2">
              <p className="text-gray-400 font-lato text-sm">
                © 2025 Veloriya. All rights reserved.
              </p>
              <p className="text-gray-400 font-lato text-sm italic">
                Developed & Designed with ❤️ by Prem
              </p>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm font-lato transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-gray-400 hover:text-white text-sm font-lato transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookie-policy" className="text-gray-400 hover:text-white text-sm font-lato transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
