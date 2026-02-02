import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { formatCurrency } from '../utils/currency';
import io from 'socket.io-client';
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  TrendingUp,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrderIcon,
  Logout as LogOut,
  Inventory as Package,
  Upload
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  description: string;
  image: string;
  category: string;
  features: string[];
  inStock: boolean;
  featured: boolean;
}

interface NewProduct extends Omit<Product, '_id'> {}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  recentOrders: Order[];
  revenue: number;
  revenueData: {
    date: string;
    revenue: number;
  }[];
  categoryData: {
    name: string;
    orders: number;
  }[];
  orderStatusData: {
    status: string;
    count: number;
  }[];
}

interface Order {
  _id: string;
  total: number;
  status: string;
}

interface OrderPlacedEvent {
  _id: string;
  total: number;
  status: string;
}

interface BulkProduct extends Omit<Product, '_id'> {}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name?: string;
  }>;
  label?: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    recentOrders: [],
    revenue: 0,
    revenueData: [],
    categoryData: [],
    orderStatusData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    price: 0,
    originalPrice: null,
    description: '',
    category: '',
    image: '',
    features: [],
    inStock: true,
    featured: false,
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [bulkProducts, setBulkProducts] = useState<BulkProduct[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isAdmin, adminLogout } = useAdminAuth();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    try {
      console.log('Fetching dashboard stats...');
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Stats response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Stats error data:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Stats data received:', data);
      
      const stats: DashboardStats = {
        totalProducts: data.totalProducts || 0,
        totalOrders: data.totalOrders || 0,
        totalCategories: data.totalCategories || 0,
        recentOrders: Array.isArray(data.recentOrders) ? data.recentOrders : [],
        revenue: data.revenue || 0,
        revenueData: Array.isArray(data.revenueData) ? data.revenueData : [],
        categoryData: Array.isArray(data.categoryData) ? data.categoryData : [],
        orderStatusData: Array.isArray(data.orderStatusData) ? data.orderStatusData : []
      };
      
      setStats(stats);
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard statistics');
    }
  }, []);

  useEffect(() => {
    if (!isAdmin || !user?.isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchCategories();
  }, [isAdmin, user, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Socket.IO is temporarily disabled until backend implementation
    const fetchDataPeriodically = () => {
      fetchStats();
      fetchCategories();
    };

    // Fetch data every 30 seconds as a fallback for real-time updates
    const interval = setInterval(fetchDataPeriodically, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchStats]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newCategory })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add category');
      }
      
      setSuccess('Category added successfully');
      setNewCategory('');
      setShowAddCategoryModal(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This will affect all products in this category.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete category');
      
      setSuccess('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchProducts(), fetchStats()]);
    } catch (err) {
      console.error('Dashboard data error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    }
  };

  const handleAddProduct = async () => {
    try {
      console.log('Current product data:', newProduct);
      
      const requiredFields = {
        name: newProduct.name,
        price: newProduct.price,
        description: newProduct.description,
        category: newProduct.category,
        image: newProduct.image
      };

      const emptyFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([field]) => field);

      if (emptyFields.length > 0) {
        setError(`Please fill in the following required fields: ${emptyFields.join(', ')}`);
        return;
      }

      const productData = {
        ...newProduct,
        originalPrice: newProduct.originalPrice || undefined
      };

      const response = await fetch(`${API_URL}/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product');
      }
      
      await fetchDashboardData();
      setShowAddModal(false);
      setNewProduct({
        name: '',
        price: 0,
        originalPrice: null,
        description: '',
        category: categories.length > 0 ? categories[0]._id : '',
        image: '',
        features: [],
        inStock: true,
        featured: false,
      });
      setError('');
    } catch (error: unknown) {
      console.error('Error adding product:', error);
      setError(error instanceof Error ? error.message : 'Failed to add product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      if (!response.ok) throw new Error('Failed to delete product');
      
      await fetchDashboardData();
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return;

    try {
      const deletePromises = selectedProducts.map(productId =>
        fetch(`${API_URL}/admin/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        })
      );

      await Promise.all(deletePromises);
      await fetchDashboardData();
      setSelectedProducts([]);
      setError('');
    } catch (err) {
      setError('Failed to delete some products');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleBulkProductAdd = async () => {
    try {
      if (bulkProducts.length === 0) {
        setError('No products to add');
        return;
      }

      const results = await Promise.allSettled(
        bulkProducts.map(async (product) => {
          try {
            const response = await fetch(`${API_URL}/admin/products`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify(product),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`Failed to add product "${product.name}": ${errorData.message || response.statusText}`);
            }

            return await response.json();
          } catch (error) {
            console.error('Error adding product:', error);
            throw error;
          }
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected');

      if (failed.length > 0) {
        console.error('Failed products:', failed.map(f => f.reason));
        setError(`Failed to add ${failed.length} products. Check console for details.`);
      } else {
        setError('');
      }

      if (successful > 0) {
        await fetchDashboardData();
        setBulkProducts([]);
        setShowBulkAddModal(false);
      }

      console.log(`Added ${successful} products successfully, ${failed.length} failed`);
    } catch (err) {
      console.error('Bulk add error:', err);
      setError('Failed to add products. Check console for details.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        let products: BulkProduct[];

        if (file.name.endsWith('.json')) {
          products = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          const lines = content
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

          if (lines.length < 2) {
            throw new Error('CSV file must contain headers and at least one product');
          }

          const headers = lines[0].split(',').map(h => h.trim());
          const requiredHeaders = ['name', 'price', 'description', 'category', 'image'];
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

          if (missingHeaders.length > 0) {
            throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
          }

          if (categories.length === 0) {
            throw new Error('Please add at least one category before importing products');
          }
          
          console.log('Processing CSV with headers:', headers);
          
          products = await Promise.all(lines.slice(1).map(async (line, index) => {
            const values: string[] = [];
            let currentValue = '';
            let insideQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                insideQuotes = !insideQuotes;
              } else if (char === ',' && !insideQuotes) {
                values.push(currentValue.trim());
                currentValue = '';
              } else {
                currentValue += char;
              }
            }
            values.push(currentValue.trim());

            if (values.length !== headers.length) {
              throw new Error(`Invalid number of values in line ${index + 2}`);
            }

            console.log(`Processing line ${index + 2}:`, values);

            const product: any = {};
            for (let i = 0; i < headers.length; i++) {
              const header = headers[i];
              const value = values[i].replace(/^"|"$/g, '');

              if (header === 'price' || header === 'originalPrice') {
                const parsedPrice = parseFloat(value);
                if (isNaN(parsedPrice)) {
                  throw new Error(`Invalid price in line ${index + 2}`);
                }
                product[header] = parsedPrice;
              } else if (header === 'features') {
                product[header] = value ? value.split(';').map(f => f.trim()).filter(Boolean) : [];
              } else if (header === 'inStock' || header === 'featured') {
                product[header] = value.toLowerCase() === 'true';
              } else if (header === 'category') {
                const category = categories.find(c => c.name.toLowerCase() === value.toLowerCase());
                if (!category) {
                  throw new Error(`Invalid category "${value}" in line ${index + 2}. Valid categories are: ${categories.map(c => c.name).join(', ')}`);
                }
                console.log(`Mapped category "${value}" to ID:`, category._id);
                product[header] = category._id;
              } else {
                product[header] = value;
              }
            }

            for (const field of requiredHeaders) {
              if (!product[field]) {
                throw new Error(`Missing required field "${field}" in line ${index + 2}`);
              }
            }

            console.log(`Processed product ${index + 1}:`, product);
            return product;
          }));
        } else {
          throw new Error('Unsupported file format. Please upload a JSON or CSV file.');
        }

        console.log('Final products to be added:', products);
        setBulkProducts(products);
        setError('');
      } catch (err) {
        console.error('File parsing error:', err);
        setError(err instanceof Error ? err.message : 'Failed to parse file. Please check the format.');
        setBulkProducts([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
      setBulkProducts([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  const renderDashboard = () => (
    <div className="w-full px-4 md:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Products Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full">
                Products
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalProducts || 0}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <OrderIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">
                Orders
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalOrders || 0}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1 rounded-full">
                Revenue
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {formatCurrency(stats.revenue || 0)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
          </div>
        </div>

        {/* Total Categories Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <CategoryIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full">
                Categories
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalCategories || 0}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Categories</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Revenue Trend
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.revenueData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value: number) => `₹${value}`}
                />
                <RechartsTooltip
                  wrapperStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#F3F4F6',
                    padding: '8px'
                  }}
                  formatter={(value: number) => [`₹${value}`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Category Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Orders by Category
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.categoryData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280' }}
                />
                <RechartsTooltip
                  wrapperStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#F3F4F6',
                    padding: '8px'
                  }}
                  formatter={(value: number) => [`${value} orders`, 'Orders']}
                />
                <Bar
                  dataKey="orders"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Order Status Distribution
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#10B981" /> {/* Delivered - Green */}
                  <Cell fill="#3B82F6" /> {/* Processing - Blue */}
                  <Cell fill="#F59E0B" /> {/* Pending - Yellow */}
                  <Cell fill="#EF4444" /> {/* Cancelled - Red */}
                </Pie>
                <RechartsTooltip
                  wrapperStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#F3F4F6',
                    padding: '8px'
                  }}
                  formatter={(value: number, name: string) => [`${value} orders`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Delivered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Cancelled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="w-full px-4 md:px-0">
      {products.length > 0 && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={selectedProducts.length === products.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600"
              />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {selectedProducts.length} products selected
              </span>
            </div>
            {selectedProducts.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <DeleteIcon className="w-4 h-4" />
                Delete Selected
              </button>
            )}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const category = categories.find(c => c._id === product.category);
          
          return (
            <div key={product._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="relative">
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts([...selectedProducts, product._id]);
                      } else {
                        setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                      }
                    }}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600"
                  />
                </div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {product.name}
                  </h3>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200"
                  >
                    <DeleteIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Category: {category?.name || 'Unknown'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.inStock 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8">
        {/* Tab Navigation */}
        <div className="mb-8 px-4 md:px-0">
          <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeTab === 'products'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Products
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'products' && (
          <>
            <div className="mb-8 flex flex-wrap gap-4 px-4 md:px-0">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <AddIcon className="w-4 h-4" />
                Add Product
              </button>
              <button
                onClick={() => setShowBulkAddModal(true)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Upload className="w-4 h-4" />
                Bulk Add Products
              </button>
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <CategoryIcon className="w-4 h-4" />
                Add Category
              </button>
            </div>
            {renderProducts()}
          </>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Add New Product
              </h2>
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Product Name *"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Price *"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  />
                  <input
                    type="number"
                    placeholder="Original Price"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                    value={newProduct.originalPrice || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <textarea
                  placeholder="Description *"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent h-24 resize-none"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option value="">Select Category *</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Image URL *"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                />
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newProduct.inStock}
                      onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">In Stock</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newProduct.featured}
                      onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Featured</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={categories.length === 0}
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Add New Category
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Category Name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Products Modal */}
      {showBulkAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Bulk Add Products
              </h2>
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload JSON or CSV file
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json,.csv"
                    onChange={handleFileUpload}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/40"
                  />
                </div>
                
                {bulkProducts.length > 0 && (
                  <div>
                    <p className="text-green-600 dark:text-green-400 mb-2">
                      {bulkProducts.length} products ready to add
                    </p>
                    <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                      {bulkProducts.map((product, index) => (
                        <div key={index} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border-b last:border-b-0 border-gray-200 dark:border-gray-700">
                          {product.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowBulkAddModal(false);
                    setBulkProducts([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkProductAdd}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={bulkProducts.length === 0}
                >
                  Add Products
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminDashboard; 
