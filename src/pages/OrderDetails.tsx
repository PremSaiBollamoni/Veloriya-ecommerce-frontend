import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Package, Truck, CheckCircle, AlertCircle, CreditCard, Calendar, MapPin } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { formatCurrency } from '../utils/currency';

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Address {
  firstName: string;
  lastName: string;
  addressLine: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface PaymentMethod {
  type: 'CARD' | 'UPI' | 'EMI' | 'WALLET';
  cardLast4?: string;
  cardExpiry?: string;
  cardNetwork?: string;
  upiId?: string;
  upiProvider?: string;
  emiMonths?: number;
  emiBank?: string;
  emiInterestRate?: number;
  walletProvider?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  tax: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
}

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${API_URL}/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch order details');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'text-success-500 bg-success-50 dark:bg-success-900/20';
      case 'cancelled':
        return 'text-error-500 bg-error-50 dark:bg-error-900/20';
      case 'shipped':
        return 'text-primary-500 bg-primary-50 dark:bg-primary-900/20';
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-primary-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-error-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPaymentMethodDetails = (paymentMethod?: PaymentMethod) => {
    if (!paymentMethod || !paymentMethod.type) {
      return 'Payment method not specified';
    }

    switch (paymentMethod.type) {
      case 'CARD':
        return `Card ending in ${paymentMethod.cardLast4 || '****'}`;
      case 'UPI':
        return `UPI ID: ${paymentMethod.upiId || 'Not specified'}`;
      case 'EMI':
        return `${paymentMethod.emiMonths || 0} months EMI from ${paymentMethod.emiBank || 'Not specified'}`;
      case 'WALLET':
        return `${paymentMethod.walletProvider || 'Not specified'} Wallet`;
      default:
        return 'Payment method not specified';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-error-500">{error || 'Order not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-poppins text-3xl font-bold text-gray-900 dark:text-white">
            Order Details
          </h1>
          <p className="font-lato text-gray-600 dark:text-gray-400 mt-1">
            Order #{order._id.slice(-8)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getStatusIcon(order.status)}
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 inline-block mr-1" />
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="space-y-2">
                {order.isPaid && (
                  <div className="flex items-center text-success-500">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>Paid on {new Date(order.paidAt!).toLocaleDateString()}</span>
                  </div>
                )}
                {order.isDelivered && (
                  <div className="flex items-center text-success-500">
                    <Truck className="w-4 h-4 mr-2" />
                    <span>Delivered on {new Date(order.deliveredAt!).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-poppins text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-nunito font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </h4>
                      <p className="font-lato text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {item.quantity}
                      </p>
                      <p className="font-lato text-sm text-gray-600 dark:text-gray-400">
                        Price per item: {formatCurrency(item.price)}
                      </p>
                    </div>
                    <span className="font-poppins font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-primary-500 mr-2" />
                <h2 className="font-poppins text-lg font-semibold text-gray-900 dark:text-white">
                  Payment Information
                </h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Method</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.paymentMethod ? getPaymentMethodDetails(order.paymentMethod) : 'Payment method not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</p>
                  <p className={`text-sm ${
                    order.paymentStatus === 'paid' ? 'text-success-500' : 
                    order.paymentStatus === 'failed' ? 'text-error-500' : 
                    'text-gray-500'
                  }`}>
                    {order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-primary-500 mr-2" />
                <h2 className="font-poppins text-lg font-semibold text-gray-900 dark:text-white">
                  Shipping Address
                </h2>
              </div>
              <div className="space-y-2">
                <p className="font-nunito font-semibold text-gray-900 dark:text-white">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.shippingAddress.addressLine}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.shippingAddress.country}
                </p>
                {order.shippingAddress.phone && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Phone: {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-poppins text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(order.tax)}
                  </span>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(order.totalAmount + order.tax)}
                    </span>
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

export default OrderDetails; 