'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { RefreshCw, Download, DollarSign } from 'lucide-react';

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

// SVG Pie Chart Component (Donut Chart)
const DonutChartSVG = ({ data, hoveredSegment, setHoveredSegment, setTooltip }: any) => {
  const radius = 80;
  const innerRadius = 40;
  const centerX = 120;
  const centerY = 120;
  let cumulativePercentage = 0;

  const createArcPath = (startAngle: number, endAngle: number, isInner: boolean = false) => {
    const r = isInner ? innerRadius : radius;
    const start = polarToCartesian(centerX, centerY, r, endAngle);
    const end = polarToCartesian(centerX, centerY, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    if (isInner) {
      return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
    }
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${centerX} ${centerY} Z`;
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <svg width="240" height="240" className="mx-auto max-w-full h-auto" viewBox="0 0 240 240">
      {data.map((item: any, index: number) => {
        const startAngle = cumulativePercentage * 3.6;
        const endAngle = (cumulativePercentage + item.value) * 3.6;
        cumulativePercentage += item.value;
        
        return (
          <g key={index}>
            <path
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
            <path
              d={createArcPath(startAngle, endAngle, true)}
              fill="transparent"
              stroke="transparent"
            />
          </g>
        );
      })}
    </svg>
  );
};

// Bar Chart Component
const BarChartSVG = ({ data, hoveredSegment, setHoveredSegment, isDark }: any) => {
  const maxValue = Math.max(...data.map((item: any) => item.amount));
  const barWidth = 50;
  const chartHeight = 200;
  const chartWidth = 400;
  const padding = 40;

  return (
    <svg width={chartWidth} height={chartHeight + 40} className="mx-auto max-w-full h-auto" viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}>
      {/* Grid lines */}
      {[0, 10, 20, 30].map((value) => {
        const yPos = chartHeight - (value / 30) * chartHeight;
        return (
          <g key={value}>
            <line
              x1={padding}
              y1={yPos}
              x2={chartWidth - padding}
              y2={yPos}
              stroke={isDark ? "#374151" : "#E5E7EB"}
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <text
              x={padding - 10}
              y={yPos + 5}
              fill={isDark ? "#9CA3AF" : "#6B7280"}
              fontSize="12"
              textAnchor="end"
            >
              {value}.000
            </text>
          </g>
        );
      })}
      
      {/* Bars */}
      {data.map((item: any, index: number) => {
        const barHeight = (item.amount / maxValue) * chartHeight;
        const x = padding + index * (barWidth + 30);
        const y = chartHeight - barHeight;
        
        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="#10B981"
              rx="4"
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredSegment(item.name)}
              onMouseLeave={() => setHoveredSegment(null)}
            />
            <text
              x={x + barWidth / 2}
              y={chartHeight + 25}
              fill={isDark ? "#D1D5DB" : "#374151"}
              fontSize="11"
              textAnchor="middle"
              transform={`rotate(-45 ${x + barWidth / 2} ${chartHeight + 25})`}
            >
              {item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name}
            </text>
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
      <section className="py-12 bg-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 ${
                isDark ? "text-white" : "text-black"
              }`}>
                Tokenomics
              </h2>
              <p className={`text-base sm:text-lg ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                Manage SIZ token allocations and distribution
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium ${
                isDark
                  ? "bg-gray-800/50 hover:bg-gray-700/70 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}>
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh Data</span>
                <span className="sm:hidden">Refresh</span>
              </button>
              <button className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium ${
                isDark
                  ? "bg-gray-800/50 hover:bg-gray-700/70 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}>
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Report</span>
                <span className="sm:hidden">Export</span>
              </button>
              <button className="px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg">
                <DollarSign className="w-4 h-4" />
                SIZ
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className={`rounded-xl p-6 border transition-colors duration-200 text-center ${
              isDark
                ? "bg-gray-800/50 border-gray-700/50"
                : "bg-white border-gray-200"
            }`}>
              <h3 className={`text-sm font-medium mb-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                Total Supply
              </h3>
              <p className={`text-3xl sm:text-4xl font-bold mb-1 ${
                isDark ? "text-green-400" : "text-green-600"
              }`}>
                100M
              </p>
              <p className={`text-sm ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}>
                SIZ tokens
              </p>
            </div>
            <div className={`rounded-xl p-6 border transition-colors duration-200 text-center ${
              isDark
                ? "bg-gray-800/50 border-gray-700/50"
                : "bg-white border-gray-200"
            }`}>
              <h3 className={`text-sm font-medium mb-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                Allocated
              </h3>
              <p className={`text-3xl sm:text-4xl font-bold mb-1 ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                0M
              </p>
              <p className={`text-sm ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}>
                0% of total
              </p>
            </div>
            <div className={`rounded-xl p-6 border transition-colors duration-200 text-center ${
              isDark
                ? "bg-gray-800/50 border-gray-700/50"
                : "bg-white border-gray-200"
            }`}>
              <h3 className={`text-sm font-medium mb-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                Remaining
              </h3>
              <p className={`text-3xl sm:text-4xl font-bold mb-1 ${
                isDark ? "text-green-400" : "text-green-600"
              }`}>
                100M
              </p>
              <p className={`text-sm ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}>
                Available for allocation
              </p>
            </div>
            <div className={`rounded-xl p-6 border transition-colors duration-200 text-center ${
              isDark
                ? "bg-gray-800/50 border-gray-700/50"
                : "bg-white border-gray-200"
            }`}>
              <h3 className={`text-sm font-medium mb-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                Categories
              </h3>
              <p className={`text-3xl sm:text-4xl font-bold mb-1 ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                05
              </p>
              <p className={`text-sm ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}>
                Allocation categories
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Donut Chart */}
            <div className={`rounded-xl p-6 border ${
              isDark
                ? "bg-gray-800/50 border-gray-700/50"
                : "bg-white border-gray-200"
            }`}>
              <h3 className={`text-lg sm:text-xl font-bold mb-2 ${
                isDark ? "text-white" : "text-black"
              }`}>
                Allocation Distribution
              </h3>
              <p className={`text-sm mb-6 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                Percentage breakdown by category
              </p>
              
              <div className="h-64 sm:h-80 flex items-center justify-center mb-6">
                <DonutChartSVG 
                  data={tokenAllocationData}
                  hoveredSegment={hoveredSegment}
                  setHoveredSegment={setHoveredSegment}
                  setTooltip={setTooltip}
                />
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4">
                {tokenAllocationData.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 ${
                      hoveredSegment === item.name ? 'opacity-100' : 'opacity-80'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className={`text-sm ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart */}
            <div className={`rounded-xl p-6 border ${
              isDark
                ? "bg-gray-800/50 border-gray-700/50"
                : "bg-white border-gray-200"
            }`}>
              <h3 className={`text-lg sm:text-xl font-bold mb-2 ${
                isDark ? "text-white" : "text-black"
              }`}>
                Allocation Amounts
              </h3>
              <p className={`text-sm mb-6 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                Token amounts by category
              </p>
              
              <div className="h-64 sm:h-80 flex items-center justify-center overflow-x-auto">
                <BarChartSVG 
                  data={barChartData}
                  hoveredSegment={hoveredSegment}
                  setHoveredSegment={setHoveredSegment}
                  isDark={isDark}
                />
              </div>
            </div>
          </div>

          {/* SIZ Token Utility Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`rounded-xl p-6 border ${
              isDark
                ? "bg-gray-800/50 border-gray-700/50"
                : "bg-white border-gray-200"
            }`}>
              <h4 className={`text-lg font-semibold mb-3 ${
                isDark ? "text-white" : "text-black"
              }`}>
                ERP Operations
              </h4>
              <p className={`text-sm leading-6 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                SIZ tokens are used for operational payments within the Sizland ERP system and business operations.
              </p>
            </div>
            <div className={`rounded-xl p-6 border ${
              isDark
                ? "bg-gray-800/50 border-gray-700/50"
                : "bg-white border-gray-200"
            }`}>
              <h4 className={`text-lg font-semibold mb-3 ${
                isDark ? "text-white" : "text-black"
              }`}>
                Community Incentives
              </h4>
              <p className={`text-sm leading-6 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                Tokens are distributed to community members for participation, growth, and ecosystem development.
              </p>
            </div>
            <div className={`rounded-xl p-6 border ${
              isDark
                ? "bg-gray-800/50 border-gray-700/50"
                : "bg-white border-gray-200"
            }`}>
              <h4 className={`text-lg font-semibold mb-3 ${
                isDark ? "text-white" : "text-black"
              }`}>
                Governance & Liquidity
              </h4>
              <p className={`text-sm leading-6 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                SIZ serves as a governance instrument and provides liquidity for the Sizland ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Tokenomics;
