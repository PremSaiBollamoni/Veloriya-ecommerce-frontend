import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cookie,
  Info,
  Settings,
  Shield,
  Clock,
  ToggleLeft,
  Globe,
  HelpCircle
} from 'lucide-react';

const CookiePolicy: React.FC = () => {
  const sections = [
    {
      icon: Cookie,
      title: "What Are Cookies",
      content: `Cookies are small text files that are stored on your device when you visit our website. They help us:
        • Remember your preferences
        • Understand how you use our site
        • Improve your shopping experience
        • Keep you signed in
        • Protect your data`
    },
    {
      icon: Info,
      title: "Types of Cookies We Use",
      content: `We use the following types of cookies:
        • Essential cookies - Required for basic site functionality
        • Preference cookies - Remember your settings and choices
        • Analytics cookies - Help us understand site usage
        • Marketing cookies - Used for personalized advertisements
        • Security cookies - Protect against fraud and verify your identity`
    },
    {
      icon: Settings,
      title: "How We Use Cookies",
      content: `We use cookies to:
        • Process your orders
        • Remember your shopping cart
        • Provide personalized recommendations
        • Analyze site traffic and performance
        • Improve site functionality
        • Ensure secure transactions`
    },
    {
      icon: Shield,
      title: "Third-Party Cookies",
      content: `Some cookies are placed by our trusted partners for:
        • Payment processing
        • Analytics services
        • Social media integration
        • Advertisement delivery
        • Customer support features`
    },
    {
      icon: Clock,
      title: "Cookie Duration",
      content: `Cookies on our site may be:
        • Session cookies - Temporary, deleted when you close your browser
        • Persistent cookies - Remain until they expire or you delete them
        • Third-party cookies - Set by our partners and service providers`
    },
    {
      icon: ToggleLeft,
      title: "Managing Cookies",
      content: `You can control cookies through:
        • Browser settings
        • Privacy preferences
        • Cookie consent banner
        • Third-party opt-out tools
        • Device settings`
    },
    {
      icon: Globe,
      title: "International Data Transfers",
      content: `Cookie data may be processed in:
        • Your country of residence
        • Countries where we operate
        • Locations of our service providers
        
        We ensure appropriate safeguards for international transfers.`
    },
    {
      icon: HelpCircle,
      title: "Questions and Contact",
      content: `For questions about our cookie policy, contact us at:
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
            Cookie Policy
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
            This Cookie Policy explains how Veloriya uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
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

export default CookiePolicy; 