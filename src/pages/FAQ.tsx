import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQData {
  [category: string]: FAQItem[];
}

const FAQ: React.FC = () => {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const categories = [
    "Orders & Shipping",
    "Returns & Refunds",
    "Product Information",
    "Account & Orders",
    "Payment & Security"
  ] as const;

  const questions: FAQData = {
    "Orders & Shipping": [
      {
        question: "How long does shipping take?",
        answer: "Standard shipping within India takes 3-5 business days. Express shipping is available for 1-2 business days delivery. International shipping may take 7-14 business days depending on the destination."
      },
      {
        question: "Do you ship internationally?",
        answer: "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. You can see the exact shipping cost during checkout after entering your address."
      }
    ],
    "Returns & Refunds": [
      {
        question: "What is your return policy?",
        answer: "We offer a 30-day return policy for unused items in original packaging. Returns are free for customers in India. International returns may be subject to shipping charges. Please visit our Returns page for detailed information."
      },
      {
        question: "How do I initiate a return?",
        answer: "To initiate a return, log into your account, go to your orders, and click on \"Return Item\" next to the product you wish to return. Follow the instructions to generate a return label and track your return."
      }
    ],
    "Product Information": [
      {
        question: "How do I find my size?",
        answer: "You can find detailed size charts on our Size Guide page. We provide measurements for all items to help you find the perfect fit. If you're between sizes, we recommend going up a size for a more comfortable fit."
      },
      {
        question: "Are your products authentic?",
        answer: "Yes, all products sold on Veloriya are 100% authentic. We source directly from authorized manufacturers and distributors to ensure quality and authenticity."
      }
    ],
    "Account & Orders": [
      {
        question: "How do I track my order?",
        answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and viewing your order history."
      },
      {
        question: "Can I modify or cancel my order?",
        answer: "Orders can be modified or cancelled within 1 hour of placement. After that, the order enters our fulfillment process and cannot be changed. Please contact customer support for assistance."
      }
    ],
    "Payment & Security": [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit/debit cards, UPI, net banking, and popular digital wallets. All payments are processed securely through our payment partners."
      },
      {
        question: "Is my payment information secure?",
        answer: "Yes, we use industry-standard SSL encryption to protect your payment information. We never store your complete credit card details on our servers."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find answers to common questions about our products, shipping, returns, and more.
          </p>
        </div>

        <div className="space-y-8">
          {categories.map((category, categoryIndex) => (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <h2 className="px-6 py-4 bg-gray-50 dark:bg-gray-700 text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                {category}
              </h2>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {questions[category].map((item, index) => {
                  const itemIndex = categoryIndex * 100 + index;
                  const isOpen = openItem === itemIndex;

                  return (
                    <div key={item.question} className="transition-all duration-200">
                      <button
                        onClick={() => setOpenItem(isOpen ? null : itemIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                      >
                        <div className="flex items-center">
                          <HelpCircle className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-900 dark:text-white font-medium">
                            {item.question}
                          </span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                      <div
                        className={`px-6 overflow-hidden transition-all duration-200 ${
                          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
                        }`}
                      >
                        <p className="text-gray-600 dark:text-gray-400">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Still have questions?{' '}
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

export default FAQ; 