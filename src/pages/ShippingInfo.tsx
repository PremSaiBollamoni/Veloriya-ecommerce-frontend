import React from "react";
import { Truck, Clock, Globe, Shield } from "lucide-react";

interface ShippingMethod {
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
  cost: string;
}

const ShippingInfo: React.FC = () => {
  const shippingMethods: ShippingMethod[] = [
    {
      icon: Truck,
      title: "Standard Shipping",
      description: "Best value for non-urgent deliveries",
      time: "3-5 business days",
      cost: "₹99 or FREE for orders above ₹999"
    },
    {
      icon: Clock,
      title: "Express Shipping",
      description: "Fast delivery for urgent orders",
      time: "1-2 business days",
      cost: "₹199"
    },
    {
      icon: Globe,
      title: "International Shipping",
      description: "Worldwide delivery service",
      time: "7-14 business days",
      cost: "Calculated at checkout"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Shipping Information
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Fast and reliable shipping options to get your order to you.
          </p>
        </div>

        {/* Shipping Methods */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Shipping Methods
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shippingMethods.map((method) => (
              <div
                key={method.title}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
              >
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center mb-4">
                  <method.icon className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {method.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {method.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {method.time}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Shield className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {method.cost}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tracking & Delivery */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Tracking & Delivery
          </h2>
          <div className="prose prose-lg dark:prose-invert">
            <p className="text-gray-600 dark:text-gray-400">
              We provide real-time tracking for all orders. Once your order ships, you'll receive:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 dark:text-gray-400">
              <li>Shipping confirmation email with tracking number</li>
              <li>Real-time tracking updates via SMS (optional)</li>
              <li>Delivery protection for lost or damaged packages</li>
              <li>Signature confirmation for orders above ₹5000</li>
            </ul>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Important Information
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Shipping Restrictions
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We currently do not ship to PO boxes or APO/FPO addresses. Some items may have 
                additional shipping restrictions due to size, weight, or local regulations.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Delivery Times
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Delivery times are estimates and may vary based on location, weather conditions, 
                or customs processing for international orders. Orders placed after 2 PM IST will 
                be processed the next business day.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Order Processing
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Most orders are processed within 24 hours of payment confirmation. During peak 
                seasons or sales events, processing times may be slightly longer.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Need help tracking your order?{" "}
            <a
              href="/contact"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo; 