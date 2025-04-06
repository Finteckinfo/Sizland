'use client';

import React from 'react';

const roadmap = [
  {
    title: 'Community Launch & Introduction',
    date: 'Q2 2025',
    description:
      'Official introduction of the Sizland ecosystem and community. Establishing our presence with a focus on education, trust, and transparency.',
    badge: 'Live',
  },
  {
    title: 'Sizland Portal – Lounge & Core Modules',
    date: 'Q2 2025',
    description:
      'Deployment of the Sizland Hub with initial access to the Lounge area, offering seamless navigation to the ERP system, exchange, and investment modules.',
  },
  {
    title: 'Unified Wallet System',
    date: 'Q3 2025',
    description:
      'Launch of an integrated wallet supporting the SIZ token and all internal company tokens, providing secure and simplified access across the platform.',
  },
  {
    title: 'Multi-Tenant ERP Platform',
    date: 'Q3 2025',
    description:
      'Rollout of the SaaS-based ERP system enabling companies to tokenize operations and manage workflows through customized tools.',
  },
  {
    title: 'Integrated Cryptocurrency Exchange',
    date: 'Q4 2025',
    description:
      'Introduction of an in-platform exchange allowing seamless trading of SIZ and company tokens, enhancing liquidity and accessibility.',
  },
  {
    title: 'SIZ Token Utility & Staking',
    date: 'Q4 2025',
    description:
      'Expansion of SIZ token functionality including staking mechanisms, fee utility, and participation in governance as the ecosystem matures.',
  },
  {
    title: 'Investment Fund Activation',
    date: 'Q1 2026',
    description:
      'Launch of our sustainable investment operations powered by ecosystem-generated revenue, driving value for users, partners, and stakeholders.',
  },
];

const Roadmap = () => {
  return (
    <div className="flex justify-center px-4">
      <ol className="relative border-s border-gray-200 dark:border-gray-700 max-w-3xl w-full">
        {roadmap.map((item, index) => (
          <li key={index} className="mb-10 ms-6">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
              <svg
                className="w-2.5 h-2.5 text-blue-800 dark:text-blue-300"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
              </svg>
            </span>
            <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
              {item.title}
              {item.badge && (
                <span className="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-blue-900 dark:text-blue-300 ms-3">
                  {item.badge}
                </span>
              )}
            </h3>
            <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
              {item.date}
            </time>
            <p className="text-base font-normal text-gray-500 dark:text-gray-400">
              {item.description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Roadmap;
