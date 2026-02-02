import React from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, 
  ShoppingBag, 
  CreditCard, 
  UserCheck, 
  ShieldCheck, 
  AlertTriangle,
  FileText,
  MessageSquare
} from 'lucide-react';

const TermsOfService: React.FC = () => {
  const sections = [
    {
      icon: Scale,
      title: "Agreement to Terms",
      content: `By accessing or using Veloriya's services, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services.`
    },
    {
      icon: ShoppingBag,
      title: "Use of Our Services",
      content: `Our services are intended for:
        • Personal, non-commercial use
        • Users aged 18 and above
        • Legal purchases and transactions
        • Legitimate business purposes

        You agree not to:
        • Violate any laws or regulations
        • Infringe on others' rights
        • Use our services for illegal activities
        • Attempt to gain unauthorized access`
    },
    {
      icon: CreditCard,
      title: "Purchases and Payment",
      content: `When making a purchase:
        • All prices are in specified currency
        • Payment must be made in full
        • We accept major credit cards and digital payments
        • Orders are subject to availability
        • We reserve the right to refuse service
        • Prices may change without notice`
    },
    {
      icon: UserCheck,
      title: "User Accounts",
      content: `Account holders must:
        • Provide accurate information
        • Maintain account security
        • Not share account credentials
        • Update information as needed
        • Be responsible for all account activity`
    },
    {
      icon: ShieldCheck,
      title: "Intellectual Property",
      content: `All content on our platform is protected by:
        • Copyright laws
        • Trademark rights
        • Intellectual property rights
        
        You may not:
        • Copy or reproduce content
        • Modify or create derivatives
        • Distribute our content
        • Use our trademarks without permission`
    },
    {
      icon: AlertTriangle,
      title: "Limitation of Liability",
      content: `We are not liable for:
        • Indirect or consequential damages
        • Loss of profits or data
        • Service interruptions
        • Third-party actions
        • Events beyond our control`
    },
    {
      icon: FileText,
      title: "Changes to Terms",
      content: `We may modify these terms at any time. Changes will be effective immediately upon posting. Continued use of our services constitutes acceptance of modified terms.`
    },
    {
      icon: MessageSquare,
      title: "Contact Information",
      content: `For questions about these terms, contact us at:
        prem.0820.04@gmail.com`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8"
        >
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Welcome to Veloriya. These Terms of Service govern your use of our website, products, and services. Please read these terms carefully before using our services.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center mr-4">
                  <section.icon className="w-6 h-6 text-primary-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 