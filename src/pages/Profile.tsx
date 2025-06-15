import React, { useState, useEffect } from 'react';
import { 
  User, Package, Settings, LogOut, Edit2, Save, X, ShoppingBag, 
  Heart, Bell, Shield, MapPin, CreditCard, Phone, Calendar, Mail, Star 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { OrderItem, ProfileFormData } from '../types/user';
import axios from 'axios';
import { API_URL } from '../config';
import { updateUserProfile, getUserProfile } from '../services/user';

interface UserStats {
  totalOrders: number;
  wishlistItems: number;
  savedCards: number;
  savedAddresses: number;
  memberLevel?: string;
}

interface Activity {
  id: string;
  type: 'order' | 'wishlist' | 'review';
  message: string;
  date: string;
}

const Profile: React.FC = () => {
  const { user, token, logout, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'settings'>('overview');
  const [editedUser, setEditedUser] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        setError('');

        // Fetch user stats
        const statsResponse = await axios.get(`${API_URL}/users/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsResponse.data);

        // Fetch recent activity
        const activityResponse = await axios.get(`${API_URL}/users/activity`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecentActivity(activityResponse.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate required fields
      if (!editedUser.name || !editedUser.email) {
        throw new Error('Name and email are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editedUser.email)) {
        throw new Error('Please enter a valid email address');
      }

      // If changing password, validate password fields
      if (editedUser.newPassword) {
        if (!editedUser.currentPassword) {
          throw new Error('Current password is required to set a new password');
        }
        if (editedUser.newPassword !== editedUser.confirmPassword) {
          throw new Error('New password and confirm password do not match');
        }
        if (editedUser.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters long');
        }
      }

      // Only include fields that have values
      const updateData = {
        name: editedUser.name.trim(),
        email: editedUser.email.trim(),
        ...(editedUser.phone ? { phone: editedUser.phone.trim() } : {}),
        ...(editedUser.address ? { address: editedUser.address.trim() } : {}),
        ...(editedUser.newPassword ? {
          currentPassword: editedUser.currentPassword,
          newPassword: editedUser.newPassword
        } : {})
      };

      const updatedUser = await updateUserProfile(updateData, token);
      
      if (!updatedUser) {
        throw new Error('No response received from server');
      }

      setUser(updatedUser);
      setSuccess('Profile updated successfully');
      setEditedUser(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedUser({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const statsData = [
    { icon: ShoppingBag, label: 'Total Orders', value: stats?.totalOrders || 0 },
    { icon: Heart, label: 'Wishlist Items', value: stats?.wishlistItems || 0 },
    { icon: CreditCard, label: 'Saved Cards', value: stats?.savedCards || 0 },
    { icon: MapPin, label: 'Saved Addresses', value: stats?.savedAddresses || 0 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-600 dark:text-error-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative mb-8 bg-gradient-to-r from-blue-500 to-teal-400 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="font-poppins text-4xl font-bold text-white mb-4">
                  {user.name}
                </h1>
                <div className="space-y-2">
                  <div className="flex items-center text-white/90">
                    <Mail className="w-5 h-5 mr-3" />
                    <span className="font-lato">{user.email}</span>
                  </div>
                  <div className="flex items-center text-white/90">
                    <Calendar className="w-5 h-5 mr-3" />
                    <span className="font-lato">Member since {new Date(user.memberSince).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    })}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center text-white/90">
                      <Phone className="w-5 h-5 mr-3" />
                      <span className="font-lato">{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Member Badge */}
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <Shield className="w-5 h-5 text-white mr-2" />
                <span className="text-white font-medium">
                  {stats?.memberLevel || 'Member'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 font-lato">{stat.label}</p>
                  <p className="text-2xl font-bold font-poppins text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-lg">
                  <stat.icon className="w-6 h-6 text-primary-500" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold ${
                    activeTab === 'overview'
                      ? 'text-primary-500 border-b-2 border-primary-500'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold ${
                    activeTab === 'orders'
                      ? 'text-primary-500 border-b-2 border-primary-500'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold ${
                    activeTab === 'settings'
                      ? 'text-primary-500 border-b-2 border-primary-500'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Settings
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-poppins text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-nunito font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Full Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedUser.name}
                              onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="font-lato text-gray-900 dark:text-white py-3">{user.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-nunito font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Email Address
                          </label>
                          {isEditing ? (
                            <input
                              type="email"
                              value={editedUser.email}
                              onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="font-lato text-gray-900 dark:text-white py-3">{user.email}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-nunito font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number
                          </label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={editedUser.phone}
                              onChange={(e) => setEditedUser(prev => ({ ...prev, phone: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="font-lato text-gray-900 dark:text-white py-3">{editedUser.phone || 'Not set'}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-nunito font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Default Address
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedUser.address}
                              onChange={(e) => setEditedUser(prev => ({ ...prev, address: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="font-lato text-gray-900 dark:text-white py-3">{editedUser.address || 'Not set'}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end">
                        {!isEditing ? (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center px-4 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Profile
                          </button>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSubmit}
                              className="flex items-center px-4 py-2 bg-success-500 hover:bg-success-600 text-white rounded-lg transition-colors"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h3 className="font-poppins text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Recent Activity
                      </h3>
                      <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`p-2 rounded-lg ${
                                activity.type === 'order' 
                                  ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-500'
                                  : activity.type === 'wishlist'
                                  ? 'bg-warning-100 dark:bg-warning-900/20 text-warning-500'
                                  : 'bg-success-100 dark:bg-success-900/20 text-success-500'
                              }`}>
                                {activity.type === 'order' ? <Package className="w-5 h-5" />
                                  : activity.type === 'wishlist' ? <Heart className="w-5 h-5" />
                                  : <Star className="w-5 h-5" />
                                }
                              </div>
                              <div>
                                <p className="font-nunito text-gray-900 dark:text-white">
                                  {activity.message}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {activity.date}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="space-y-6">
                    {user.orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-nunito font-semibold text-gray-900 dark:text-white">
                              Order #{order.id}
                            </h3>
                            <p className="font-lato text-gray-600 dark:text-gray-400 text-sm">
                              {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-nunito font-semibold ${
                              order.status === 'delivered' 
                                ? 'bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-400'
                                : 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <p className="font-poppins font-bold text-gray-900 dark:text-white mt-1">
                              ${order.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {order.items.map((item: OrderItem, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="font-lato text-gray-600 dark:text-gray-400">
                                {item.name} x{item.quantity}
                              </span>
                              <span className="font-nunito text-gray-900 dark:text-white">
                                ${item.price.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4">
                          <Link
                            to={`/orders/${order.id}`}
                            className="text-primary-500 hover:text-primary-600 font-semibold text-sm"
                          >
                            View Order Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-poppins text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Account Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <div>
                              <p className="font-nunito text-gray-900 dark:text-white">
                                Notifications
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage your notification preferences
                              </p>
                            </div>
                          </div>
                          <button className="text-primary-500 hover:text-primary-600">
                            Manage
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <div>
                              <p className="font-nunito text-gray-900 dark:text-white">
                                Security
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Update your password and security settings
                              </p>
                            </div>
                          </div>
                          <button className="text-primary-500 hover:text-primary-600">
                            Manage
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <div>
                              <p className="font-nunito text-gray-900 dark:text-white">
                                Payment Methods
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage your saved payment methods
                              </p>
                            </div>
                          </div>
                          <button className="text-primary-500 hover:text-primary-600">
                            Manage
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <div>
                              <p className="font-nunito text-gray-900 dark:text-white">
                                Addresses
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage your saved addresses
                              </p>
                            </div>
                          </div>
                          <button className="text-primary-500 hover:text-primary-600">
                            Manage
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-poppins text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <Link
                  to="/orders"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Package className="w-5 h-5 mr-3" />
                  <span className="font-lato">View All Orders</span>
                </Link>
                
                <Link
                  to="/wishlist"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Heart className="w-5 h-5 mr-3" />
                  <span className="font-lato">My Wishlist</span>
                </Link>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center px-4 py-3 text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span className="font-lato">Sign Out</span>
                </button>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-poppins text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Status
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-lato text-gray-600 dark:text-gray-400">Member Level</span>
                  <span className={`font-nunito font-semibold ${
                    stats?.memberLevel === 'Veloriya Plus Member' 
                      ? 'text-primary-500'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {stats?.memberLevel || 'Standard'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-lato text-gray-600 dark:text-gray-400">Total Orders</span>
                  <span className="font-nunito font-semibold text-gray-900 dark:text-white">
                    {stats?.totalOrders || 0}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-lato text-gray-600 dark:text-gray-400">Member Since</span>
                  <span className="font-nunito font-semibold text-gray-900 dark:text-white">
                    {new Date(user.memberSince).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {stats?.memberLevel === 'Veloriya Plus Member' && (
                  <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <p className="text-sm text-primary-600 dark:text-primary-400">
                      🌟 You're a Veloriya Plus Member! Enjoy exclusive benefits and priority support.
                    </p>
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

export default Profile;
