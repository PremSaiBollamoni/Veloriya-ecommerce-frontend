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
  ShoppingCart as OrderIcon
} from '@mui/icons-material';

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

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    recentOrders: [],
    revenue: 0
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
        revenue: data.revenue || 0
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h3 className="text-base md:text-lg font-semibold text-gray-600">Total Products</h3>
          <p className="text-2xl md:text-3xl font-bold mt-2">{stats.totalProducts || 0}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h3 className="text-base md:text-lg font-semibold text-gray-600">Total Orders</h3>
          <p className="text-2xl md:text-3xl font-bold mt-2">{stats.totalOrders || 0}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h3 className="text-base md:text-lg font-semibold text-gray-600">Total Revenue</h3>
          <p className="text-2xl md:text-3xl font-bold mt-2">{formatCurrency(stats.revenue || 0)}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h3 className="text-base md:text-lg font-semibold text-gray-600">Total Categories</h3>
          <p className="text-2xl md:text-3xl font-bold mt-2">{stats.totalCategories || 0}</p>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="w-full px-4 md:px-0">
      {products.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <input
              type="checkbox"
              checked={selectedProducts.length === products.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-gray-600">
              {selectedProducts.length} products selected
            </span>
          </div>
          {selectedProducts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete Selected
            </button>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {products.map((product) => {
          const category = categories.find(c => c._id === product.category);
          
          return (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
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
                  className="absolute top-2 left-2 h-4 w-4 text-blue-600 z-10"
                />
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg md:text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2">{formatCurrency(product.price)}</p>
                {product.originalPrice && (
                  <p className="text-gray-400 text-sm line-through mb-2">
                    {formatCurrency(product.originalPrice)}
                  </p>
                )}
                <p className="text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                <p className="text-gray-600 mb-2">Category: {category?.name || 'Unknown'}</p>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                  <span className={`px-2 py-1 rounded ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl md:text-2xl font-bold">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 md:px-4 md:py-2 rounded hover:bg-red-600 text-sm md:text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-6 md:py-8">
        <div className="mb-6 md:mb-8 flex flex-wrap gap-2 px-4 md:px-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 md:px-4 md:py-2 rounded text-sm md:text-base ${
              activeTab === 'dashboard'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1 md:px-4 md:py-2 rounded text-sm md:text-base ${
              activeTab === 'products'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Products
          </button>
        </div>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'products' && (
          <>
            <div className="mb-6 flex flex-col sm:flex-row gap-4 px-4 md:px-0">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm md:text-base"
                >
                  Add Product
                </button>
                <button
                  onClick={() => setShowBulkAddModal(true)}
                  className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm md:text-base"
                >
                  Bulk Add Products
                </button>
              </div>
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm md:text-base"
              >
                Add Category
              </button>
            </div>
            {renderProducts()}
          </>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Product Name *"
                className="w-full p-2 border rounded"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="Price *"
                className="w-full p-2 border rounded"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
              />
              <input
                type="number"
                placeholder="Original Price (optional)"
                className="w-full p-2 border rounded"
                value={newProduct.originalPrice || ''}
                onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value ? Number(e.target.value) : null })}
              />
              <textarea
                placeholder="Description *"
                className="w-full p-2 border rounded h-24"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
              <select
                className="w-full p-2 border rounded"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                required
              >
                <option value="">Select Category *</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-yellow-600 text-sm">Please add a category first</p>
              )}
              <input
                type="text"
                placeholder="Image URL *"
                className="w-full p-2 border rounded"
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
              />
              <input
                type="text"
                placeholder="Features (comma-separated)"
                className="w-full p-2 border rounded"
                onChange={(e) => setNewProduct({ ...newProduct, features: e.target.value.split(',').map(f => f.trim()) })}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newProduct.inStock}
                  onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                />
                <label>In Stock</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newProduct.featured}
                  onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                />
                <label>Featured</label>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={categories.length === 0}
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add New Category</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Category Name"
                className="w-full p-2 border rounded"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Bulk Add Products</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload JSON or CSV file
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              {bulkProducts.length > 0 && (
                <div>
                  <p className="text-green-600">
                    {bulkProducts.length} products ready to add
                  </p>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {bulkProducts.map((product, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {product.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowBulkAddModal(false);
                    setBulkProducts([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkProductAdd}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={bulkProducts.length === 0}
                >
                  Add {bulkProducts.length} Products
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
