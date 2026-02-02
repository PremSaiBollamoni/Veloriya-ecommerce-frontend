import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, UserCheck, Database, Bell, RefreshCw, Mail } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      icon: Shield,
      title: "Information We Collect",
      content: `We collect information you provide directly to us, including:
        • Name and contact information
        • Payment and transaction data
        • Account credentials
        • Shopping preferences and history
        • Communication preferences`
    },
    {
      icon: Lock,
      title: "How We Protect Your Data",
      content: `Your security is our priority. We implement industry-standard security measures:
        • Secure SSL encryption
        • Regular security audits
        • Secure data storage
        • Employee confidentiality agreements
        • Regular system updates`
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: `We use your information to:
        • Process your orders
        • Provide customer support
        • Send order updates
        • Improve our services
        • Personalize your shopping experience
        • Comply with legal obligations`
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: `You have the right to:
        • Access your personal data
        • Correct inaccurate data
        • Request data deletion
        • Opt-out of marketing communications
        • Export your data`
    },
    {
      icon: Database,
      title: "Data Storage",
      content: `We retain your data only as long as necessary for:
        • Order processing and fulfillment
        • Legal compliance
        • Account maintenance
        • Service improvement
        • Fraud prevention`
    },
    {
      icon: Bell,
      title: "Communications",
      content: `We may contact you regarding:
        • Order confirmations and updates
        • Account security
        • Service updates
        • Marketing (with consent)
        • Legal notices`
    },
    {
      icon: RefreshCw,
      title: "Policy Updates",
      content: `We may update this policy periodically. We will notify you of any material changes through:
        • Email notifications
        • Website announcements
        • App notifications`
    },
    {
      icon: Mail,
      title: "Contact Us",
      content: `If you have questions about our privacy policy, contact us at:
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
            Privacy Policy
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
            At Veloriya, we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your personal information when you use our services.
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

export default PrivacyPolicy; 