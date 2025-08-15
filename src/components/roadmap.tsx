'use client';

import React from 'react';

// SIZ Logo Icon Component
const SizLogoIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* SIZ Logo - Simplified geometric design */}
    <rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" opacity="0.1"/>
    <path 
      d="M7 8h10M7 12h10M7 16h6" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <circle cx="18" cy="6" r="2" fill="currentColor"/>
  </svg>
);

const roadmap = [
  {
    title: 'Phase 1: Laying the Groundwork',
    date: 'Months 1–6',
    description:
      'We\'re setting up smart contracts, building the ERP system, and getting everything secure. This includes testing our tools, setting up legal frameworks, and building our early community.',
    badge: 'Live',
  },
  {
    title: 'Phase 2: Growing the Platform ',
    date: 'Months 7–18',
    description:
      'We take things to the next level. We\'ll integrate AI features, integrate DeFi tools, and make the platform mobile-friendly. Private and public token sales will also help fund the next stage and grow our community.',
  },
  {
    title: 'Phase 3: Going Live',
    date: 'Months 19–36',
    description:
      'Everything comes together. We launch the token, offer more tools like savings and investment features, and start using NFTs and DAOs to give the community more say.',
  },
  {
    title: 'Phase 4: Long-Term Growth',
    date: '36+ Months',
    description:
      'After launch, we focus on building with the community. Sizland becomes fully decentralized, and users help shape the future. More products, more countries, and more freedom for users.',
  },
];

const Roadmap = () => {
  return (
    <div className="flex justify-center px-4">
      <ol className="relative border-s border-gray-200 dark:border-gray-700 max-w-4xl w-full">
        {roadmap.map((item, index) => (
          <li key={index} className="mb-12 ms-6">
            <span className="absolute flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900">
              <SizLogoIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
            </span>
            <h3 className="flex items-center mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              {item.title}
              {item.badge && (
                <span className="bg-green-100 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300 ms-3">
                  {item.badge}
                </span>
              )}
            </h3>
            <time className="block mb-3 text-sm font-medium leading-none text-green-600 dark:text-green-400">
              {item.date}
            </time>
            <p className="text-base font-normal text-gray-700 dark:text-gray-300 leading-relaxed">
              {item.description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Roadmap;
