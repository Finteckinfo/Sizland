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
    title: 'Phase 1: Laying the Groundwork (Current Phase: Live)',
    date: 'Months 1–12',
    description:
      'Tunaweka msingi salama wa ERP inayotumia blockchain kwa timu za mbali. Maendeleo yalianza Februari mwaka huu yakijengwa juu ya dhana na prototypes za 2023. Achievements (Months 1–7): Web ERP ya msingi iko live; mfumo wa automated workflows kwa token-based tasks unaofyatua malipo na kuhifadhi uthibitisho wa milestones on-chain; malipo ya papo hapo yamejengwa na kufanya kazi; msingi wa multichain (Algorand, Sui, Base, BNB Chain) uko tayari; kujenga jamii na mfumo wa kisheria unaendelea. Next (Months 7–12): Kuunganisha zana za kwanza za DeFi ndani ya ERP—staking, swapping, na P2P fiat/crypto services kwa kuboresha hali ya kifedha ya wafanyakazi wa mbali.',
    badge: 'Live',
  },
  {
    title: 'Phase 2: Growing the Platform',
    date: 'Months 12–18',
    description:
      'Kuzingatia matumizi bora na upatikanaji: uzoefu wa mobile-first, ujumuishaji wa AI kuboresha workflows na kutoa insights za hatari na rasilimali, na kukamilisha suite ya DeFi (staking, swapping, P2P) pamoja na uzinduzi wa token (private/public) kwa kufadhili ukuaji na kupanua jamii.',
  },
  {
    title: 'Phase 3: Going Live & Scaling',
    date: 'Months 19–36',
    description:
      'Kuleta kila kitu pamoja na kuweka kiwango cha tasnia: uzinduzi wa mfumo wa on-chain credit score unaotokana na historia ya kazi iliyoidhinishwa ndani ya ERP; huduma za mikopo zilizogatuliwa kulingana na credit score hiyo; kupeleka bidhaa sokoni kwa uzani kamili na kuwafikia watumiaji duniani; kuongeza vipengele vya enterprise vya ERP (reporting ya juu, HR, analytics za kina).',
  },
  {
    title: 'Phase 4: Decentralization & Ecosystem Growth',
    date: 'Months 37+',
    description:
      'Uendeshaji wa jamii kupitia decentralized governance ambako wamiliki wa token hupiga kura juu ya maamuzi makubwa; kuanzisha mfuko wa incubation kusaidia wabunifu wa tatu kujenga juu ya miundombinu ya Sizland; kuimarisha interoperability kwenye mitandao mingi na web3; R&D ya muda mrefu ikijumuisha ZK proofs kwa faragha na scalability.',
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
