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
    title: 'Phase 1: Foundation & Core Infrastructure',
    date: 'Q1-Q2 2024',
    description:
      'Building the foundational infrastructure with Algorand smart contracts, ARC-0059 integration, and core ERP system. Establishing security protocols, legal frameworks, and initial community development. Launch of unified wallet system and basic trading functionality.',
    badge: 'Completed',
  },
  {
    title: 'Phase 2: Platform Expansion & DeFi Integration',
    date: 'Q3-Q4 2024',
    description:
      'Expanding platform capabilities with advanced DeFi tools, AI-powered features, and mobile optimization. Integration of multi-chain support (Sui, Base, BNB Smart Chain). Private token sales and community growth initiatives. Enhanced trading features and liquidity pools.',
  },
  {
    title: 'Phase 3: Ecosystem Launch & Advanced Features',
    date: 'Q1-Q2 2025',
    description:
      'Full ecosystem launch with public token distribution, advanced investment tools, and comprehensive business management suite. Introduction of NFT marketplace, DAO governance, and cross-chain interoperability. Launch of educational platform and community-driven features.',
  },
  {
    title: 'Phase 4: Global Expansion & Decentralization',
    date: 'Q3 2025+',
    description:
      'Global expansion with multi-language support, regional partnerships, and advanced financial products. Full decentralization with community governance, advanced AI integration, and expansion into emerging markets. Development of enterprise solutions and institutional partnerships.',
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
