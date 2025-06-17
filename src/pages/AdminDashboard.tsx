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
  Tooltip,
  Drawer,
  AppBar,
  Toolbar,
  Avatar,
  Divider,
  ListItemIcon,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  ListItemButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  TrendingUp,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrderIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Inventory2 as Inventory2Icon,
  ShoppingCart as ShoppingCartIcon,
  Category as CategoryIcon2,
  MonetizationOn as MonetizationOnIcon,
} from '@mui/icons-material';
import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import Grid2 from '@mui/material/Unstable_Grid2';

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

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

interface RecentOrdersCardProps {
  orders: Order[];
}

const DRAWER_WIDTH = 240;

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%', bgcolor: color, color: 'white' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        {icon}
      </Box>
      <Typography variant="h3" component="div" sx={{ mt: 2, mb: 1 }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const RecentOrdersCard: React.FC<RecentOrdersCardProps> = ({ orders }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" component="div" gutterBottom>
        Recent Orders
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id} hover>
                <TableCell>{order._id}</TableCell>
                <TableCell align="right">{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={
                      order.status === 'completed'
                        ? 'success'
                        : order.status === 'pending'
                        ? 'warning'
                        : 'default'
                    }
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No recent orders
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
);

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const { isAdmin, adminLogout } = useAdminAuth();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      setStats({
        totalProducts: data.totalProducts || 0,
        totalOrders: data.totalOrders || 0,
        totalCategories: data.totalCategories || 0,
        recentOrders: Array.isArray(data.recentOrders) ? data.recentOrders : [],
        revenue: data.revenue || 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to fetch stats');
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/admin/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
      setProducts([]); // Ensure products is always an array
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
      setCategories([]); // Ensure categories is always an array
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchProducts(),
        fetchStats()
      ]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, fetchProducts, fetchStats]);

  useEffect(() => {
    if (!isAdmin || !user?.isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchDashboardData();
  }, [isAdmin, user, navigate, fetchDashboardData]);

  useEffect(() => {
    const fetchDataPeriodically = () => {
      fetchDashboardData();
    };

    const interval = setInterval(fetchDataPeriodically, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [fetchDashboardData]);

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {user?.name?.charAt(0) || 'A'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {user?.name || 'Admin'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administrator
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List>
        <ListItemButton
          selected={activeTab === 'dashboard'}
          onClick={() => setActiveTab('dashboard')}
        >
          <ListItemIcon>
            <DashboardIcon color={activeTab === 'dashboard' ? 'primary' : undefined} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton
          selected={activeTab === 'products'}
          onClick={() => setActiveTab('products')}
        >
          <ListItemIcon>
            <InventoryIcon color={activeTab === 'products' ? 'primary' : undefined} />
          </ListItemIcon>
          <ListItemText primary="Products" />
        </ListItemButton>
        <ListItemButton
          selected={activeTab === 'orders'}
          onClick={() => setActiveTab('orders')}
        >
          <ListItemIcon>
            <OrderIcon color={activeTab === 'orders' ? 'primary' : undefined} />
          </ListItemIcon>
          <ListItemText primary="Orders" />
        </ListItemButton>
      </List>
      <Divider />
      <List>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );

  const renderDashboard = () => (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
        <Box>
          <StatsCard
            title="Total Products"
            value={stats.totalProducts}
            icon={<Inventory2Icon />}
            color="#4CAF50"
          />
        </Box>
        <Box>
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCartIcon />}
            color="#2196F3"
          />
        </Box>
        <Box>
          <StatsCard
            title="Categories"
            value={stats.totalCategories}
            icon={<CategoryIcon />}
            color="#FF9800"
          />
        </Box>
        <Box>
          <StatsCard
            title="Revenue"
            value={formatCurrency(stats.revenue)}
            icon={<MonetizationOnIcon />}
            color="#F44336"
          />
        </Box>
      </Box>
      <Box sx={{ mt: 3 }}>
        <RecentOrdersCard orders={stats.recentOrders} />
      </Box>
    </Box>
  );

  const renderProducts = () => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h6" component="div">
            Products Management
          </Typography>
          <Box>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => setShowAddModal(true)}
              sx={{ mr: 1 }}
            >
              Add Product
            </Button>
            <Button
              startIcon={<CategoryIcon />}
              variant="outlined"
              onClick={() => setShowAddCategoryModal(true)}
            >
              Add Category
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Tooltip title="Select All">
                    <IconButton
                      onClick={(e) => handleSelectAll(selectedProducts.length !== products.length)}
                    >
                      {selectedProducts.length === products.length ? (
                        <ArrowDownwardIcon fontSize="small" />
                      ) : (
                        <ArrowUpwardIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(products) && products.map((product) => {
                const category = categories.find(c => c._id === product.category);
                return (
                  <TableRow
                    key={product._id}
                    hover
                    selected={selectedProducts.includes(product._id)}
                  >
                    <TableCell padding="checkbox">
                      <IconButton
                        onClick={() => {
                          if (selectedProducts.includes(product._id)) {
                            setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                          } else {
                            setSelectedProducts([...selectedProducts, product._id]);
                          }
                        }}
                      >
                        {selectedProducts.includes(product._id) ? (
                          <ArrowDownwardIcon fontSize="small" />
                        ) : (
                          <ArrowUpwardIcon fontSize="small" />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{category ? category.name : 'Uncategorized'}</TableCell>
                    <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.inStock ? 'In Stock' : 'Out of Stock'}
                        color={product.inStock ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleDeleteProduct(product._id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!Array.isArray(products) || products.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No products available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {selectedProducts.length > 0 && (
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button
              startIcon={<DeleteIcon />}
              variant="contained"
              color="error"
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedProducts.length})
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleMenuClick}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            <PersonIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'products' && renderProducts()}
            {/* Keep existing modals */}
          </>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={() => {
          setError(null);
          setSuccess(null);
        }}
      >
        <Alert
          onClose={() => {
            setError(null);
            setSuccess(null);
          }}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>

      {/* Keep all existing modals */}
    </Box>
  );
};

export default AdminDashboard; 
