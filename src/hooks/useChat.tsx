import { useState, useCallback, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  image: string;
  category: {
    _id: string;
    name: string;
  } | string;
  features: string[];
  rating: number;
  reviews: any[];
  inStock: boolean;
  featured: boolean;
  // add other fields as needed
}

interface ApiResponse {
  products: Product[];
}

// Store policies and FAQs
const STORE_INFO = {
  shipping: {
    free: 'Free shipping on orders over $50',
    standard: 'Standard shipping (3-5 business days): $4.99',
    express: 'Express shipping (1-2 business days): $9.99',
    international: 'International shipping available to select countries'
  },
  returns: {
    window: '30-day return window for unused items',
    process: 'Free returns with prepaid shipping label',
    conditions: 'Items must be in original packaging with tags attached'
  },
  payment: {
    methods: ['Credit/Debit Cards', 'PayPal', 'Apple Pay', 'Google Pay'],
    security: 'All transactions are secured with SSL encryption'
  },
  support: {
    hours: '24/7 Customer Support',
    email: 'support@veloriya.com',
    phone: '1-800-VELORIYA'
  }
};

// Helper function to format product details
const formatProductDetails = (product: Product) => {
  const productSlug = product._id;
  // Ensure image URL is absolute
  const imageUrl = product.image.startsWith('http') 
    ? product.image 
    : `/images/products/${product.image}`; // Adjust this path according to your public images folder structure
  
  return `<div class="product-card">
    <h3 class="text-lg font-semibold mb-2">${product.name}</h3>
    <div class="product-image-container relative pb-[100%] mb-3">
      <img 
        src="${imageUrl}" 
        alt="${product.name}" 
        class="product-image absolute top-0 left-0 w-full h-full object-cover rounded-lg"
        onerror="this.onerror=null; this.src='/images/placeholder.jpg';"
      />
    </div>
    <div class="price-tag text-xl font-bold text-primary-600 mb-2">
      $${product.price.toFixed(2)}
    </div>
    <div class="product-details text-sm">
      <p class="mb-2"><strong>Description:</strong> ${product.description}</p>
      <p class="mb-2"><strong>Key Features:</strong> ${product.features.join(', ')}</p>
      <p class="mb-2"><strong>Category:</strong> ${typeof product.category === 'object' ? product.category.name : product.category}</p>
      <div class="flex items-center mb-2">
        <strong>Rating:</strong>
        <div class="flex items-center ml-2">
          ${Array(5).fill('').map((_, i) => 
            `<svg class="w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>`
          ).join('')}
        </div>
      </div>
      <p class="mb-2">
        <strong>Availability:</strong> 
        <span class="${product.inStock ? 'text-green-600' : 'text-red-600'}">
          ${product.inStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </p>
      ${product.originalPrice > product.price ? 
        `<p class="mb-2">
          <strong>Original Price:</strong> 
          <span class="line-through text-gray-500">$${product.originalPrice.toFixed(2)}</span>
          <span class="text-green-600 ml-2">Save $${(product.originalPrice - product.price).toFixed(2)}</span>
        </p>` 
        : ''}
    </div>
    <div class="product-actions flex gap-2 mt-4">
      <a 
        href="/product/${productSlug}" 
        class="view-details-btn flex-1 py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-center transition-colors duration-200"
      >
        View Details
      </a>
      <button 
        onclick="window.dispatchEvent(new CustomEvent('add-to-cart', { detail: '${productSlug}' }))" 
        class="add-to-cart-btn flex-1 py-2 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-center transition-colors duration-200"
      >
        Add to Cart
      </button>
    </div>
  </div>`;
};

// Helper function to format cart items
const formatCartItems = (items: any[]) => {
  if (items.length === 0) {
    return "Your cart is currently empty. Would you like to see our featured products?";
  }

  return `Your Cart:
    ${items.map(item => `- ${item.name} (Quantity: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}
    
    Total Items: ${items.reduce((acc, item) => acc + item.quantity, 0)}
    Total Value: $${items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}
    
    Would you like to:
    1. View cart details
    2. Proceed to checkout
    3. Continue shopping`;
};

// Helper function to handle order tracking queries
const handleOrderTracking = (orderNumber?: string) => {
  if (!orderNumber) {
    return `To track your order, please provide your order number. You can find this in your order confirmation email.
    
    Example: "Track order #VEL123456"`;
  }

  // In a real implementation, this would call your order tracking API
  return `Order ${orderNumber} Status:
    • Order received and confirmed
    • Currently being processed
    • Expected delivery: 3-5 business days
    
    Need more details? You can:
    1. View detailed tracking information
    2. Contact our support team
    3. Update delivery preferences`;
};

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const { state: cartState } = useCart();
  const { user } = useAuth();

  // Initial greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = 'Hello';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    return greeting;
  };

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products?featured=true`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json() as Product[];
        setProducts(data);
        
        // Fix category extraction to handle both string and object categories
        const uniqueCategories = Array.from(new Set(data.map(p => 
          typeof p.category === 'object' ? p.category.name : p.category
        ))).filter(Boolean);
        setCategories(uniqueCategories);
        
        const featured = data.filter(p => p.featured);
        setFeaturedProducts(featured);

        // Enhanced initial message with proper category formatting and line breaks
        const formattedCategories = uniqueCategories.length > 0 
          ? uniqueCategories.join(', ')
          : 'All Categories';

        setMessages([{
          id: 1,
          text: `${getGreeting()}${user ? ` ${user.name}` : ''}! 👋 I'm your Veloriya shopping assistant.\n\nI can help you with:\n\n• Finding products in our categories: ${formattedCategories}\n\n• Checking order status\n\n• Shipping and delivery information\n\n• Returns and refunds\n\n• Account assistance\n\n• General inquiries\n\nHow can I assist you today?`,
          isUser: false,
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [user]);

  // Helper function to handle product queries
  const handleProductQuery = (query: string): string | null => {
    // Handle featured products request
    if (query.toLowerCase().includes('featured products')) {
      const limitedProducts = featuredProducts.slice(0, 4);
      return `<div class="products-grid">
        ${limitedProducts.map(formatProductDetails).join('')}
      </div>
      <style>
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          padding: 20px;
        }
        .product-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .product-image-container {
          position: relative;
          padding-bottom: 100%;
          overflow: hidden;
          border-radius: 8px;
        }
        .product-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }
        .product-details {
          margin: 12px 0;
          font-size: 0.875rem;
        }
        .product-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }
        .view-details-btn, .add-to-cart-btn {
          flex: 1;
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          text-align: center;
          text-decoration: none;
          transition: all 0.2s;
        }
        .view-details-btn {
          background: #f3f4f6;
          color: #111827;
        }
        .add-to-cart-btn {
          background: #2563eb;
          color: white;
        }
        .view-details-btn:hover {
          background: #e5e7eb;
        }
        .add-to-cart-btn:hover {
          background: #1d4ed8;
        }
      </style>`;
    }

    // Handle category-specific requests
    const categoryMatch = categories.find((category: string) => 
      query.toLowerCase().includes(category.toLowerCase())
    );
    if (categoryMatch) {
      const categoryProducts = products
        .filter((product: Product) => product.category === categoryMatch)
        .slice(0, 4);
      return `<div class="products-grid">
        ${categoryProducts.map(formatProductDetails).join('')}
      </div>
      <style>
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          padding: 20px;
        }
        .product-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .product-image-container {
          position: relative;
          padding-bottom: 100%;
          overflow: hidden;
          border-radius: 8px;
        }
        .product-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }
        .product-details {
          margin: 12px 0;
          font-size: 0.875rem;
        }
        .product-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }
        .view-details-btn, .add-to-cart-btn {
          flex: 1;
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          text-align: center;
          text-decoration: none;
          transition: all 0.2s;
        }
        .view-details-btn {
          background: #f3f4f6;
          color: #111827;
        }
        .add-to-cart-btn {
          background: #2563eb;
          color: white;
        }
        .view-details-btn:hover {
          background: #e5e7eb;
        }
        .add-to-cart-btn:hover {
          background: #1d4ed8;
        }
      </style>`;
    }

    // Handle specific product searches
    const searchTerms = query.toLowerCase().split(' ');
    const matchingProducts = products
      .filter((product: Product) =>
        searchTerms.some(term =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.features.some((feature: string) => feature.toLowerCase().includes(term))
        )
      )
      .slice(0, 4);

    if (matchingProducts.length > 0) {
      return `<div class="products-grid">
        ${matchingProducts.map(formatProductDetails).join('')}
      </div>
      <style>
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          padding: 20px;
        }
        .product-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .product-image-container {
          position: relative;
          padding-bottom: 100%;
          overflow: hidden;
          border-radius: 8px;
        }
        .product-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }
        .product-details {
          margin: 12px 0;
          font-size: 0.875rem;
        }
        .product-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }
        .view-details-btn, .add-to-cart-btn {
          flex: 1;
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          text-align: center;
          text-decoration: none;
          transition: all 0.2s;
        }
        .view-details-btn {
          background: #f3f4f6;
          color: #111827;
        }
        .add-to-cart-btn {
          background: #2563eb;
          color: white;
        }
        .view-details-btn:hover {
          background: #e5e7eb;
        }
        .add-to-cart-btn:hover {
          background: #1d4ed8;
        }
      </style>`;
    }

    return null;
  };

  const handleCustomerQuery = (query: string): string | null => {
    const lowerQuery = query.toLowerCase();
    
    // Handle shipping related queries
    if (lowerQuery.includes('shipping') || lowerQuery.includes('delivery')) {
      return `Here's our shipping information:

${Object.entries(STORE_INFO.shipping).map(([key, value]) => `• ${value}`).join('\n')}

Would you like to:
1. Calculate shipping cost for your cart
2. Track an existing order
3. Learn about international shipping`;
    }

    // Handle return related queries
    if (lowerQuery.includes('return') || lowerQuery.includes('refund')) {
      return `Our Return Policy:

${Object.entries(STORE_INFO.returns).map(([key, value]) => `• ${value}`).join('\n')}

Would you like to:
1. Start a return
2. Check return status
3. Get a return shipping label`;
    }

    // Handle payment related queries
    if (lowerQuery.includes('payment') || lowerQuery.includes('pay')) {
      return `Payment Information:

• Accepted Payment Methods: ${STORE_INFO.payment.methods.join(', ')}
• ${STORE_INFO.payment.security}

Need help with:
1. Adding a payment method
2. Payment security
3. Payment issues`;
    }

    // Handle order tracking
    if (lowerQuery.includes('track') || lowerQuery.includes('order status')) {
      const orderMatch = query.match(/#?([A-Za-z0-9]+)/);
      return handleOrderTracking(orderMatch?.[1]);
    }

    // Handle cart queries
    if (lowerQuery.includes('cart') || lowerQuery.includes('basket')) {
      return formatCartItems(cartState.items);
    }

    // Handle contact/support queries
    if (lowerQuery.includes('contact') || lowerQuery.includes('support') || lowerQuery.includes('help')) {
      return `We're here to help!

${Object.entries(STORE_INFO.support).map(([key, value]) => `• ${value}`).join('\n')}

You can:
1. Chat with us here 24/7
2. Email us at ${STORE_INFO.support.email}
3. Call us at ${STORE_INFO.support.phone}`;
    }

    // If no specific customer service query is matched, check for product queries
    return handleProductQuery(query);
  };

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    // First check for customer service queries
    const customerResponse = handleCustomerQuery(userMessage);
    if (customerResponse) {
      const botResponse: Message = {
        id: messages.length + 2,
        text: customerResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
      return;
    }

    // If no direct match, use AI for more complex queries
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an expert shopping assistant for Veloriya, a premium eCommerce store. You have comprehensive knowledge about our store and should respond in a helpful, friendly, and knowledgeable manner.

Store Information:
${JSON.stringify(STORE_INFO, null, 2)}

Store Categories: ${categories.join(', ')}

Available Products:
${products.map(product => 
  `${product.name} - $${product.price} - ${product.description} - Category: ${typeof product.category === 'object' ? product.category.name : product.category}`
).join('\n')}

Current user cart items: ${JSON.stringify(cartState.items)}
User authentication status: ${user ? 'Logged in' : 'Not logged in'}
Previous messages: ${messages.map(m => `${m.isUser ? 'User' : 'Assistant'}: ${m.text}`).join('\n')}
User message: ${userMessage}

Remember to:
1. Be friendly and professional
2. Provide specific product recommendations when relevant
3. Offer additional assistance
4. Use bullet points for clarity
5. Include relevant policy information when applicable`
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      const botMessage = data.candidates[0].content.parts[0].text;

      const newBotMessage: Message = {
        id: messages.length + 2,
        text: botMessage,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "I apologize for the inconvenience. I'm having trouble processing your request right now. Please try again, or contact our support team at support@veloriya.com or call 1-800-VELORIYA for immediate assistance.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, cartState.items, user, products, categories]);

  return { messages, isLoading, sendMessage };
};
