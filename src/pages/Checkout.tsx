import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, Truck, CheckCircle, Plus, Smartphone, CreditCard as CardIcon, Clock, Wallet } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';
import { formatCurrency } from '../utils/currency';

// Import payment logos
import gpayLogo from '../assets/payment/gpay-logo.svg';
import phonepeLogo from '../assets/payment/phonepe-logo.svg';
import paytmLogo from '../assets/payment/paytm-logo.svg';
import bhimLogo from '../assets/payment/bhim-logo.svg';
import amazonpayLogo from '../assets/payment/amazonpay-logo.svg';
import mobikwikLogo from '../assets/payment/mobikwik-logo.svg';

interface Address {
  _id: string;
  firstName: string;
  lastName: string;
  addressLine: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

type PaymentMethod = 'CARD' | 'UPI' | 'EMI' | 'WALLET';

interface PaymentMethodData {
  type: PaymentMethod;
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

interface FormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
  upiId: string;
  walletType: string;
  upiProvider: string;
  firstName: string;
  lastName: string;
  addressLine: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface EMIOption {
  months: number;
  interestRate: number;
  bankName: string;
}

const EMI_OPTIONS: EMIOption[] = [
  { months: 3, interestRate: 13, bankName: 'HDFC Bank' },
  { months: 6, interestRate: 14, bankName: 'ICICI Bank' },
  { months: 9, interestRate: 14, bankName: 'Axis Bank' },
  { months: 12, interestRate: 15, bankName: 'SBI' },
];

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { state, clearCart } = useCart();
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CARD');
  const [selectedEMIOption, setSelectedEMIOption] = useState<EMIOption | null>(null);

  const [formData, setFormData] = useState({
    // Card Payment
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    
    // UPI Payment
    upiId: '',
    
    // Wallet Payment
    walletType: '',
    
    // Address fields...
    firstName: '',
    lastName: '',
    addressLine: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: '',
    isDefault: false
  });

  useEffect(() => {
    if (state.items.length === 0) {
      navigate('/cart');
      return;
    }

    const fetchAddresses = async () => {
      try {
        const response = await axios.get(`${API_URL}/addresses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAddresses(response.data);
        // Set default address if available
        const defaultAddress = response.data.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
        }
        // If no addresses found, show the new address form
        if (response.data.length === 0) {
          setShowNewAddressForm(true);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setError('Failed to fetch addresses. Please try adding a new address.');
        setShowNewAddressForm(true);
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [token, state.items.length, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAddressSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/addresses`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          addressLine: formData.addressLine,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone,
          isDefault: formData.isDefault
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAddresses([...addresses, response.data]);
      setSelectedAddressId(response.data._id);
      setShowNewAddressForm(false);
    } catch (err) {
      setError('Failed to save address');
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddressId) {
      setError('Please select a shipping address');
      return;
    }

    try {
      setError(null);
      let paymentMethodData: PaymentMethodData = {
        type: selectedPaymentMethod
      };

      // Add payment method specific data
      switch (selectedPaymentMethod) {
        case 'CARD':
          if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.nameOnCard) {
            setError('Please fill in all card details');
            return;
          }
          paymentMethodData = {
            ...paymentMethodData,
            cardLast4: formData.cardNumber.slice(-4),
            cardExpiry: formData.expiryDate,
            cardNetwork: 'VISA' // You might want to detect this based on card number
          };
          break;
        case 'UPI':
          if (!formData.upiId) {
            setError('Please enter UPI ID');
            return;
          }
          paymentMethodData = {
            ...paymentMethodData,
            upiId: formData.upiId,
            upiProvider: formData.walletType || 'OTHER'
          };
          break;
        case 'EMI':
          if (!selectedEMIOption) {
            setError('Please select an EMI option');
            return;
          }
          paymentMethodData = {
            ...paymentMethodData,
            emiMonths: selectedEMIOption.months,
            emiBank: selectedEMIOption.bankName,
            emiInterestRate: selectedEMIOption.interestRate
          };
          break;
        case 'WALLET':
          if (!formData.walletType) {
            setError('Please select a wallet');
            return;
          }
          paymentMethodData = {
            ...paymentMethodData,
            walletProvider: formData.walletType
          };
          break;
      }

      const response = await axios.post(
        `${API_URL}/orders`,
        {
          items: state.items.map(item => ({
            product: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          shippingAddress: selectedAddressId,
          totalAmount: state.total,
          tax: state.total * 0.08,
          paymentMethod: paymentMethodData
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 201) {
        clearCart();
        navigate('/order-confirmation', { replace: true });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order. Please try again.');
    }
  };

  const calculateEMIAmount = (option: EMIOption) => {
    const principal = state.total;
    const ratePerMonth = option.interestRate / 12 / 100;
    const emi = (principal * ratePerMonth * Math.pow(1 + ratePerMonth, option.months)) / 
               (Math.pow(1 + ratePerMonth, option.months) - 1);
    return emi;
  };

  const isEMIAvailable = state.total >= 5000;

  const renderPaymentForm = () => {
    switch (selectedPaymentMethod) {
      case 'CARD':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-nunito font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Card Number *
              </label>
              <input
                type="text"
                name="cardNumber"
                required
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-nunito font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date *
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  required
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-nunito font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  CVV *
                </label>
                <input
                  type="text"
                  name="cvv"
                  required
                  placeholder="123"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-nunito font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Name on Card *
              </label>
              <input
                type="text"
                name="nameOnCard"
                required
                value={formData.nameOnCard}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'UPI':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-nunito font-semibold text-gray-700 dark:text-gray-300 mb-2">
                UPI ID *
              </label>
              <input
                type="text"
                name="upiId"
                required
                placeholder="username@upi"
                value={formData.upiId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <button
                type="button"
                className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <img src={gpayLogo} alt="Google Pay" className="h-8 w-8 mb-2" />
                <span className="text-sm">Google Pay</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <img src={phonepeLogo} alt="PhonePe" className="h-8 w-8 mb-2" />
                <span className="text-sm">PhonePe</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <img src={paytmLogo} alt="Paytm" className="h-8 w-8 mb-2" />
                <span className="text-sm">Paytm</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <img src={bhimLogo} alt="BHIM" className="h-8 w-8 mb-2" />
                <span className="text-sm">BHIM</span>
              </button>
            </div>
          </div>
        );

      case 'EMI':
        return (
          <div className="space-y-4">
            {!isEMIAvailable ? (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  EMI is available for orders above {formatCurrency(5000)}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Choose your EMI plan:
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {EMI_OPTIONS.map((option) => {
                    const emiAmount = calculateEMIAmount(option);
                    return (
                      <label
                        key={option.months}
                        className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedEMIOption?.months === option.months
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="emiOption"
                          value={option.months}
                          checked={selectedEMIOption?.months === option.months}
                          onChange={() => setSelectedEMIOption(option)}
                          className="sr-only"
                        />
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {option.months} Months | {option.bankName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Interest Rate: {option.interestRate}% p.a.
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary-600">
                              {formatCurrency(emiAmount)}/month
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Total: {formatCurrency(emiAmount * option.months)}
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        );

      case 'WALLET':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <button
                type="button"
                className="flex flex-col items-center justify-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setFormData({ ...formData, walletType: 'paytm' })}
              >
                <img src={paytmLogo} alt="Paytm" className="h-10 w-10 mb-2" />
                <span className="text-sm font-medium">Paytm</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center justify-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setFormData({ ...formData, walletType: 'amazonpay' })}
              >
                <img src={amazonpayLogo} alt="Amazon Pay" className="h-10 w-10 mb-2" />
                <span className="text-sm font-medium">Amazon Pay</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center justify-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setFormData({ ...formData, walletType: 'mobikwik' })}
              >
                <img src={mobikwikLogo} alt="MobiKwik" className="h-10 w-10 mb-2" />
                <span className="text-sm font-medium">MobiKwik</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  const subtotal = state.total;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-poppins text-3xl font-bold text-gray-900 dark:text-white">
            Checkout
          </h1>
          <p className="font-lato text-gray-600 dark:text-gray-400 mt-1">
            Complete your order securely
          </p>
        </div>

        <form onSubmit={handleOrderSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-8">
              {/* Shipping Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Truck className="w-5 h-5 text-primary-500 mr-2" />
                    <h2 className="font-poppins text-xl font-semibold text-gray-900 dark:text-white">
                      Shipping Information
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                    className="text-primary-500 hover:text-primary-600 font-nunito font-semibold flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    New Address
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-error-50 dark:bg-error-900/20 text-error-500 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Saved Addresses */}
                {!showNewAddressForm && addresses.length > 0 && (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <label
                        key={address._id}
                        className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedAddressId === address._id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shippingAddress"
                          value={address._id}
                          checked={selectedAddressId === address._id}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex justify-between">
                          <div>
                            <p className="font-nunito font-semibold text-gray-900 dark:text-white">
                              {address.firstName} {address.lastName}
                            </p>
                            <p className="font-lato text-gray-600 dark:text-gray-400 mt-1">
                              {address.addressLine}
                            </p>
                            <p className="font-lato text-gray-600 dark:text-gray-400">
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                            <p className="font-lato text-gray-600 dark:text-gray-400">
                              {address.country}
                            </p>
                            {address.phone && (
                              <p className="font-lato text-gray-600 dark:text-gray-400 mt-1">
                                {address.phone}
                              </p>
                            )}
                          </div>
                          {address.isDefault && (
                            <span className="text-primary-500 font-nunito font-semibold text-sm">
                              Default
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Message when no addresses are found */}
                {!showNewAddressForm && addresses.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      No saved addresses found. Please add a new address.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(true)}
                      className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-nunito font-semibold rounded-lg transition-colors"
                    >
                      Add New Address
                    </button>
                  </div>
                )}

                {/* New Address Form */}
                {showNewAddressForm && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-nunito font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-nunito font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-nunito font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        name="addressLine"
                        required
                        value={formData.addressLine}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-nunito font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-nunito font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        State *
                      </label>
                      <select
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                        style={{ maxHeight: '300px' }}
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 pt-6 text-gray-700 dark:text-gray-300">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-nunito font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-nunito font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Country *
                      </label>
                      <input
                        type="text"
                        name="country"
                        required
                        value="India"
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-not-allowed opacity-75"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-nunito font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={formData.isDefault}
                          onChange={handleInputChange}
                          className="form-checkbox h-5 w-5 text-primary-500"
                        />
                        <span className="ml-2 font-lato text-gray-700 dark:text-gray-300">
                          Set as default address
                        </span>
                      </label>
                    </div>

                    <div className="md:col-span-2 flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-nunito font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddressSubmit}
                        className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-nunito font-semibold rounded-lg transition-colors"
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-5 h-5 text-primary-500 mr-2" />
                  <h2 className="font-poppins text-xl font-semibold text-gray-900 dark:text-white">
                    Payment Information
                  </h2>
                  <Lock className="w-4 h-4 text-success-500 ml-auto" />
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('CARD')}
                      className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${
                        selectedPaymentMethod === 'CARD'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <CardIcon className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('UPI')}
                      className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${
                        selectedPaymentMethod === 'UPI'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Smartphone className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">UPI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('EMI')}
                      className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${
                        selectedPaymentMethod === 'EMI'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Clock className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">EMI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('WALLET')}
                      className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${
                        selectedPaymentMethod === 'WALLET'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Wallet className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">Wallet</span>
                    </button>
                  </div>
                </div>

                {/* Payment Method Forms */}
                {renderPaymentForm()}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-8 lg:h-fit">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="font-poppins text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Order Summary
                </h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {state.items.map((item) => (
                    <div key={item._id} className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-nunito font-semibold text-gray-900 dark:text-white">
                          {item.name}
                        </h4>
                        <p className="font-lato text-sm text-gray-600 dark:text-gray-400">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <span className="font-poppins font-semibold text-gray-900 dark:text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span className="text-success-600 dark:text-success-400">Free</span>
                  </div>

                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between font-poppins font-bold text-lg text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-4">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  className="w-full mt-6 px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white font-nunito font-semibold rounded-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Place Order - ${total.toFixed(2)}
                </button>

                <div className="mt-4 text-center">
                  <p className="font-lato text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-success-500" />
                    Secure checkout powered by SSL encryption
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;