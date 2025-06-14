import React from "react";
import { Ruler, Info } from "lucide-react";

interface SizeChart {
  category: string;
  sizes: {
    size: string;
    chest: string;
    waist: string;
    hips: string;
    [key: string]: string;
  }[];
  additionalMeasurements?: {
    label: string;
    value: string;
  }[];
}

const SizeGuide: React.FC = () => {
  const sizeCharts: SizeChart[] = [
    {
      category: "Women's Clothing",
      sizes: [
        { size: "XS", chest: "31-32", waist: "24-25", hips: "34-35" },
        { size: "S", chest: "33-34", waist: "26-27", hips: "36-37" },
        { size: "M", chest: "35-36", waist: "28-29", hips: "38-39" },
        { size: "L", chest: "37-38", waist: "30-31", hips: "40-41" },
        { size: "XL", chest: "39-40", waist: "32-33", hips: "42-43" },
        { size: "XXL", chest: "41-42", waist: "34-35", hips: "44-45" }
      ],
      additionalMeasurements: [
        { label: "Shoulder", value: "Measure across the back from shoulder point to shoulder point" },
        { label: "Sleeve Length", value: "Measure from shoulder point to wrist" },
        { label: "Length", value: "Measure from highest point of shoulder to desired length" }
      ]
    },
    {
      category: "Men's Clothing",
      sizes: [
        { size: "XS", chest: "34-36", waist: "28-30", hips: "34-36" },
        { size: "S", chest: "36-38", waist: "30-32", hips: "36-38" },
        { size: "M", chest: "38-40", waist: "32-34", hips: "38-40" },
        { size: "L", chest: "40-42", waist: "34-36", hips: "40-42" },
        { size: "XL", chest: "42-44", waist: "36-38", hips: "42-44" },
        { size: "XXL", chest: "44-46", waist: "38-40", hips: "44-46" }
      ],
      additionalMeasurements: [
        { label: "Neck", value: "Measure around the base of the neck" },
        { label: "Sleeve", value: "Measure from center back neck, across shoulder, down to wrist" },
        { label: "Inseam", value: "Measure from crotch to bottom of leg" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Size Guide
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find your perfect fit with our detailed size charts and measurement guide.
          </p>
        </div>

        {/* How to Measure */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <Ruler className="w-6 h-6 text-primary-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              How to Measure
            </h2>
          </div>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p>
              For the most accurate measurements, please follow these guidelines:
            </p>
            <ul>
              <li>Use a fabric measuring tape</li>
              <li>Keep the tape straight but not tight</li>
              <li>Measure yourself in your underwear</li>
              <li>Get help from someone else for the most accurate measurements</li>
            </ul>
          </div>
        </div>

        {/* Size Charts */}
        {sizeCharts.map((chart, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              {chart.category}
            </h2>

            {/* Size Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Size</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Chest (inches)</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Waist (inches)</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Hips (inches)</th>
                  </tr>
                </thead>
                <tbody>
                  {chart.sizes.map((size, sizeIndex) => (
                    <tr
                      key={sizeIndex}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{size.size}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{size.chest}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{size.waist}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{size.hips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Additional Measurements */}
            {chart.additionalMeasurements && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Additional Measurements
                </h3>
                <div className="space-y-4">
                  {chart.additionalMeasurements.map((measurement, measurementIndex) => (
                    <div
                      key={measurementIndex}
                      className="flex items-start space-x-3 text-sm"
                    >
                      <Info className="w-5 h-5 text-primary-500 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {measurement.label}:
                        </span>{" "}
                        <span className="text-gray-600 dark:text-gray-400">
                          {measurement.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Help Section */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400">
            Need help finding your size?{" "}
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

export default SizeGuide; 