import React from "react";
import { Package, Truck, CreditCard, Clock } from "lucide-react";

interface ReturnStep {
  icon: React.ElementType;
  title: string;
  description: string;
}

const Returns: React.FC = () => {
  const returnSteps: ReturnStep[] = [
    {
      icon: Package,
      title: "Initiate Return",
      description: "Log into your account, go to your orders, and select the item(s) you wish to return. Make sure they meet our return eligibility criteria."
    },
    {
      icon: Clock,
      title: "Print Label",
      description: "Once your return is approved, we'll email you a prepaid return shipping label. Print it and securely attach it to your package."
    },
    {
      icon: Truck,
      title: "Ship Package",
      description: "Drop off your package at any authorized shipping location. Keep the tracking number for reference until the return is complete."
    },
    {
      icon: CreditCard,
      title: "Get Refund",
      description: "Once we receive and inspect your return, we'll process your refund within 3-5 business days to your original payment method."
    }
  ];

  const nonReturnableItems = [
    "Intimate apparel and swimwear",
    "Items marked as final sale",
    "Gift cards and e-gift cards",
    "Personalized or customized items",
    "Items without original tags and packaging",
    "Items showing signs of wear or use"
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Returns & Refunds
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Easy returns within 30 days. No questions asked.
          </p>
        </div>

        {/* Return Policy Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Return Policy Overview
          </h2>
          <div className="prose prose-lg dark:prose-invert">
            <p className="text-gray-600 dark:text-gray-400">
              We want you to be completely satisfied with your purchase. If you're not happy with your order, 
              you can return it within 30 days of delivery for a full refund, provided that:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 dark:text-gray-400">
              <li>Items are unused and in original condition</li>
              <li>All original tags and packaging are intact</li>
              <li>You have the original order confirmation or receipt</li>
              <li>Items are not from the non-returnable category</li>
            </ul>
          </div>
        </div>

        {/* Return Process Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Return Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {returnSteps.map((step, index) => (
              <div key={step.title} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary-500" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Non-Returnable Items */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Non-Returnable Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nonReturnableItems.map((item) => (
              <div
                key={item}
                className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3" />
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Refund Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Refund Information
          </h2>
          <div className="prose prose-lg dark:prose-invert">
            <p className="text-gray-600 dark:text-gray-400">
              Once we receive your return, we'll inspect the item and process your refund within 3-5 business days. 
              The refund will be issued to your original payment method. Please note:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 dark:text-gray-400">
              <li>Original shipping charges are non-refundable</li>
              <li>Return shipping costs are covered for defective items</li>
              <li>Store credit is available if you don't have the original payment method</li>
              <li>International returns may take longer to process</li>
            </ul>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Need help with your return?{" "}
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

export default Returns; 