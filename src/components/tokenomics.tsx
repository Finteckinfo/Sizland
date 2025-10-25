'use client';

import React, { useState } from 'react';

// Token allocation data based on SIZ Token Deployment Report
const tokenAllocationData = [
  { name: 'Community', value: 34.3, amount: '34.3M', color: '#10B981' },
  { name: 'Management', value: 30, amount: '30M', color: '#059669' },
  { name: 'Sizland Company Reserve', value: 14, amount: '14M', color: '#047857' },
  { name: 'Team', value: 14.7, amount: '14.7M', color: '#065F46' },
  { name: 'Founders (Seed Round)', value: 7, amount: '7M', color: '#064E3B' },
];

const barChartData = [
  { name: 'Community', amount: 34300000, percentage: 34.3 },
  { name: 'Management', amount: 30000000, percentage: 30 },
  { name: 'Company Reserve', amount: 14000000, percentage: 14 },
  { name: 'Team', amount: 14700000, percentage: 14.7 },
  { name: 'Founders', amount: 7000000, percentage: 7 },
];

// SVG Pie Chart Component
const PieChartSVG = ({ data, hoveredSegment, setHoveredSegment, setTooltip }: any) => {
  const radius = 60; // Reduced for mobile
  const centerX = 100; // Adjusted for mobile
  const centerY = 100; // Adjusted for mobile
  let cumulativePercentage = 0;

  const createArcPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <svg width="200" height="200" className="mx-auto max-w-full h-auto" viewBox="0 0 200 200">
      {data.map((item: any, index: number) => {
        const startAngle = cumulativePercentage * 3.6;
        const endAngle = (cumulativePercentage + item.value) * 3.6;
        cumulativePercentage += item.value;
        
        return (
          <path
            key={index}
            d={createArcPath(startAngle, endAngle)}
            fill={item.color}
            stroke={hoveredSegment === item.name ? '#10B981' : 'transparent'}
            strokeWidth={hoveredSegment === item.name ? 3 : 0}
            className="transition-all duration-200 cursor-pointer"
            onMouseEnter={(e) => {
              setHoveredSegment(item.name);
              setTooltip({
                visible: true,
                x: e.clientX,
                y: e.clientY,
                data: item
              });
            }}
            onMouseLeave={() => {
              setHoveredSegment(null);
              setTooltip({ visible: false, x: 0, y: 0, data: null });
            }}
          />
        );
      })}
    </svg>
  );
};

// Bar Chart Component
const BarChartSVG = ({ data, hoveredSegment, setHoveredSegment }: any) => {
  const maxValue = Math.max(...data.map((item: any) => item.amount));
  const barWidth = 30; // Reduced for mobile
  const chartHeight = 180; // Reduced for mobile
  const chartWidth = 350; // Reduced for mobile
  const padding = 15; // Reduced for mobile

  return (
    <svg width={chartWidth} height={chartHeight + 20} className="mx-auto max-w-full h-auto" viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`}>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((percentage) => (
        <g key={percentage}>
          <line
            x1={padding}
            y1={chartHeight - (percentage / 100) * chartHeight}
            x2={chartWidth - padding}
            y2={chartHeight - (percentage / 100) * chartHeight}
            stroke="#374151"
            strokeDasharray="3 3"
          />
          <text
            x={padding - 10}
            y={chartHeight - (percentage / 100) * chartHeight + 5}
            fill="#9CA3AF"
            fontSize="12"
            textAnchor="end"
          >
            {percentage}%
          </text>
        </g>
      ))}
      
      {/* Bars */}
      {data.map((item: any, index: number) => {
        const barHeight = (item.percentage / 100) * chartHeight;
        const x = padding + index * (barWidth + 15); // Reduced spacing for mobile
        const y = chartHeight - barHeight;
        
        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={hoveredSegment === item.name ? '#059669' : '#10B981'}
              rx="4"
              className="transition-colors duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredSegment(item.name)}
              onMouseLeave={() => setHoveredSegment(null)}
            />
          </g>
        );
      })}
    </svg>
  );
};

// Tooltip Component
const Tooltip = ({ visible, x, y, data }: any) => {
  if (!visible || !data) return null;
  
  return (
    <div
      className="fixed z-50 bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 shadow-xl pointer-events-none"
      style={{
        left: `${x + 10}px`,
        top: `${y - 10}px`,
        transform: 'translateY(-100%)'
      }}
    >
      <p className="text-white font-semibold">{data.name}</p>
      <p className="text-green-400 text-sm">
        {data.value}% • {data.amount} SIZ
      </p>
    </div>
  );
};

const Tokenomics = () => {
  const [activeToken, setActiveToken] = useState('SIZ');
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null });

  const totalSupply = 100000000; // 100M SIZ tokens
  const allocated = 0; // 0M allocated
  const remaining = 100000000; // 100M remaining

  return (
    <>
      <Tooltip 
        visible={tooltip.visible} 
        x={tooltip.x} 
        y={tooltip.y} 
        data={tooltip.data} 
      />
      <section className="py-20 bg-transparent">
        <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Tokenomics
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">
            Manage SIZ token allocations and distribution
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 px-4">
            <button className="px-4 sm:px-6 py-3 bg-gray-700/50 backdrop-blur-sm hover:bg-gray-600/70 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh Data</span>
              <span className="sm:hidden">Refresh</span>
            </button>
            <button className="px-4 sm:px-6 py-3 bg-gray-700/50 backdrop-blur-sm hover:bg-gray-600/70 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Export Report</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>

          {/* Token Selection */}
          <div className="flex justify-center gap-2 mb-8 sm:mb-12 px-4">
            <button
              onClick={() => setActiveToken('SIZ')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                activeToken === 'SIZ'
                  ? 'bg-green-500/80 backdrop-blur-sm text-white shadow-lg'
                  : 'bg-gray-700/50 backdrop-blur-sm text-gray-300 hover:bg-gray-600/70'
              }`}
            >
              SIZ (Stablecoin)
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 px-4">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-gray-600/70 transition-colors duration-200 text-center">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Supply</h3>
            <p className="text-2xl sm:text-3xl font-bold text-white">100M</p>
            <p className="text-gray-500 text-sm">SIZ tokens</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-gray-600/70 transition-colors duration-200 text-center">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Allocated</h3>
            <p className="text-2xl sm:text-3xl font-bold text-white">0M</p>
            <p className="text-gray-500 text-sm">0% of total</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-gray-600/70 transition-colors duration-200 text-center">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Remaining</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-400">100M</p>
            <p className="text-gray-500 text-sm">Available for allocation</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-gray-600/70 transition-colors duration-200 text-center">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Categories</h3>
            <p className="text-2xl sm:text-3xl font-bold text-white">5</p>
            <p className="text-gray-500 text-sm">Allocation categories</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 px-4">
          {/* Pie Chart */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 text-center">Allocation Distribution</h3>
            <p className="text-gray-400 text-sm mb-4 sm:mb-6 text-center">Percentage breakdown by category</p>
            
            <div className="h-64 sm:h-80 flex items-center justify-center">
              <PieChartSVG 
                data={tokenAllocationData}
                hoveredSegment={hoveredSegment}
                setHoveredSegment={setHoveredSegment}
                setTooltip={setTooltip}
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 sm:mt-6">
              {tokenAllocationData.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 justify-center ${
                    hoveredSegment === item.name ? 'bg-gray-700/50 backdrop-blur-sm' : ''
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-300">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 text-center">Allocation Amounts</h3>
            <p className="text-gray-400 text-sm mb-4 sm:mb-6 text-center">Token amounts by category</p>
            
            <div className="h-64 sm:h-80 flex items-center justify-center overflow-x-auto">
              <BarChartSVG 
                data={barChartData}
                hoveredSegment={hoveredSegment}
                setHoveredSegment={setHoveredSegment}
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 sm:mt-6">
              {barChartData.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 cursor-pointer justify-center ${
                    hoveredSegment === item.name ? 'bg-gray-700/50 backdrop-blur-sm' : ''
                  }`}
                  onMouseEnter={() => setHoveredSegment(item.name)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: hoveredSegment === item.name ? '#059669' : '#10B981' }}
                  />
                  <span className="text-sm text-gray-300">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 sm:mt-16 text-center px-4">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-gray-700/50 max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">SIZ Token Utility</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <h4 className="text-green-400 font-semibold">ERP Operations</h4>
                <p className="text-gray-300 text-sm">
                  SIZ tokens are used for operational payments within the Sizland ERP system and business operations.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-green-400 font-semibold">Community Incentives</h4>
                <p className="text-gray-300 text-sm">
                  Tokens are distributed to community members for participation, growth, and ecosystem development.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-green-400 font-semibold">Governance & Liquidity</h4>
                <p className="text-gray-300 text-sm">
                  SIZ serves as a governance instrument and provides liquidity for the Sizland ecosystem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default Tokenomics;
