import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Web2Icon } from './icons/web2-icon';
import { Web3Icon } from './icons/web3-icon';

interface AuthChoiceCardProps {
  title: string;
  badge: string;
  features: string[];
  ctaLabel: string;
  flavor: 'web3' | 'web2';
  onClick: () => void;
}

export const AuthChoiceCard: React.FC<AuthChoiceCardProps> = ({
  title,
  badge,
  features,
  ctaLabel,
  flavor,
  onClick,
}) => {
  const { theme } = useTheme();
  const [supportsHover, setSupportsHover] = useState(false);
  const IconComponent = flavor === 'web3' ? Web3Icon : Web2Icon;
  const isDark = theme === 'dark';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSupportsHover(!!window.matchMedia?.('(hover: hover)').matches);
    }
  }, []);

  const handleClick = () => {
    onClick();
  };

  return (
    <div
      className="auth-choice-card group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl"
      tabIndex={0}
      role="button"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Desktop: 3D flip card */}
      <div className="hidden md:block relative w-full h-[580px] perspective-1200">
        <div className={`card-content w-full h-full transition-transform duration-500 preserve-3d ${supportsHover ? 'group-hover:rotate-y-180' : ''}`}>
          {/* Card Back (shown on hover) */}
          <div className={`card-back absolute inset-0 rounded-2xl overflow-hidden backface-hidden flex items-center justify-center ${
            flavor === 'web3' 
              ? 'bg-gradient-to-br from-green-50/95 to-green-100/90 dark:from-green-950/50 dark:to-green-900/30'
              : 'bg-gradient-to-br from-blue-50/95 to-blue-100/90 dark:from-blue-950/50 dark:to-blue-900/30'
          }`}>
            <div className="card-back__glow absolute w-[180%] h-[180%] animate-spin-slow pointer-events-none">
              <div className={`w-full h-full ${
                flavor === 'web3'
                  ? 'bg-gradient-to-r from-transparent via-green-400/30 to-transparent'
                  : 'bg-gradient-to-r from-transparent via-blue-400/30 to-transparent'
              }`}></div>
            </div>
            <div className="relative w-[92%] h-[92%] rounded-2xl bg-white/95 dark:bg-slate-900/90 flex flex-col items-center justify-center gap-8 p-12 shadow-2xl text-center">
              <div className="w-20 h-20">
                <IconComponent />
              </div>
              <div>
                <span className={`inline-block px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold ${
                  flavor === 'web3'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                }`}>
                  {badge}
                </span>
                <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
              </div>
            </div>
          </div>

          {/* Card Front */}
          <div className={`card-front absolute inset-0 rounded-2xl overflow-hidden backface-hidden rotate-y-180 shadow-2xl ${
            flavor === 'web3'
              ? 'bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/80 dark:to-green-900/50'
              : 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/80 dark:to-blue-900/50'
          }`}>
            <div className="relative h-full flex flex-col p-12">
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 mb-4">
                  <IconComponent />
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs uppercase tracking-wider font-semibold mb-2 ${
                  flavor === 'web3'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                }`}>
                  {badge}
                </span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
              </div>

              {/* Features */}
              <ul className="flex-1 flex flex-col gap-4 items-center mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <svg className={`w-5 h-5 flex-shrink-0 ${
                      flavor === 'web3' ? 'text-green-500' : 'text-blue-500'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={(e) => { e.stopPropagation(); handleClick(); }}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all hover:-translate-y-1 hover:shadow-xl ${
                  flavor === 'web3'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Simple card (no flip) */}
      <div className="md:hidden">
        <div className={`relative rounded-2xl overflow-hidden shadow-xl ${
          flavor === 'web3'
            ? 'bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/80 dark:to-green-900/50'
            : 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/80 dark:to-blue-900/50'
        }`}>
          <div className="p-8 flex flex-col gap-6 min-h-[460px]">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 flex-shrink-0 bg-white/40 dark:bg-white/10 rounded-xl p-2">
                <IconComponent />
              </div>
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs uppercase tracking-wider font-semibold ${
                  flavor === 'web3'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                }`}>
                  {badge}
                </span>
                <h3 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
              </div>
            </div>

            {/* Features */}
            <ul className="flex-1 flex flex-col gap-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <svg className={`w-5 h-5 flex-shrink-0 ${
                    flavor === 'web3' ? 'text-green-500' : 'text-blue-500'
                  }`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button
              onClick={(e) => { e.stopPropagation(); handleClick(); }}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                flavor === 'web3'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1200 {
          perspective: 1200px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
      `}</style>
    </div>
  );
};
