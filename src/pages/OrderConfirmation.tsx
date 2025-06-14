import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag } from 'lucide-react';

const OrderConfirmation: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-success-500" />
            <h1 className="mt-4 text-3xl font-poppins font-bold text-gray-900 dark:text-white">
              Order Placed Successfully!
            </h1>
            <p className="mt-2 text-lg font-lato text-gray-600 dark:text-gray-400">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="text-center">
              <p className="text-sm font-lato text-gray-600 dark:text-gray-400">
                A confirmation email has been sent to your email address.
              </p>
              <p className="mt-1 text-sm font-lato text-gray-600 dark:text-gray-400">
                You can track your order status in the Orders section.
              </p>
            </div>

            <div className="mt-8 flex justify-center space-x-4">
              <Link
                to="/orders"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-nunito font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                View Orders
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-nunito font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="text-center">
              <h2 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white">
                Need Help?
              </h2>
              <p className="mt-2 text-sm font-lato text-gray-600 dark:text-gray-400">
                If you have any questions about your order, please contact our customer support.
              </p>
              <a
                href="mailto:support@veloriya.com"
                className="mt-2 inline-block text-primary-500 hover:text-primary-600 font-nunito font-semibold"
              >
                support@veloriya.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 