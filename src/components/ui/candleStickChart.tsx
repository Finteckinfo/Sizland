'use client';

import React, { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { useTheme } from 'next-themes';

type CandlePoint = [number, number, number, number, number]; // [time(ms), open, high, low, close]

const getInitialData = (): CandlePoint[] => {
  const now = Date.now();
  const interval = 1000; // 1s
  return Array.from({ length: 30 }, (_, i) => {
    const time = now - (29 - i) * interval;
    const open = 40 + Math.random() * 2;
    const close = open + (Math.random() - 0.5) * 2;
    const high = Math.max(open, close) + Math.random();
    const low = Math.min(open, close) - Math.random();
    return [time, open, high, low, close];
  });
};

export const CandleStickChart = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [data, setData] = useState<CandlePoint[]>(getInitialData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1];
        if (!last) return prev;

        const time = last[0] + 1000; // +1 second
        const open = last[4];
        const close = +(open + (Math.random() - 0.5) * 1).toFixed(2);
        const high = Math.max(open, close) + +(Math.random() * 0.5).toFixed(2);
        const low = Math.min(open, close) - +(Math.random() * 0.5).toFixed(2);

        const newCandle: CandlePoint = [time, open, high, low, close];
        return [...prev.slice(-99), newCandle];
      });
    }, 1000); // every second

    return () => clearInterval(interval);
  }, []);

  const options: Highcharts.Options = {
    chart: {
      height: 500,
      backgroundColor: 'transparent',
    },
    title: {
      text: 'Siz (Live)',
      style: { color: isDark ? '#d1d5db' : '#000000' },
    },
    xAxis: {
      type: 'datetime',
      labels: { style: { color: isDark ? '#9ca3af' : '#000000' } },
    },
    yAxis: {
      title: {
        text: 'Price (USD)',
        style: { color: isDark ? '#9ca3af' : '#000000' },
      },
      labels: { style: { color: isDark ? '#9ca3af' : '#000000' } },
    },
    tooltip: {
      split: true,
      valueDecimals: 2,
    },
    rangeSelector: {
      enabled: false,
    },
    series: [
      {
        type: 'candlestick',
        name: 'SizCoin',
        data: data,
        color: '#ef4444',
        upColor: '#22c55e',
        lineColor: '#ef4444',
      },
    ],
    credits: { enabled: false },
    navigator: { enabled: false },
    scrollbar: { enabled: false },
  };

  // Update chart theme when theme changes
  useEffect(() => {
    if (chartRef.current?.chart) {
      const chart = chartRef.current.chart;
      chart.update({
        title: {
          style: { color: isDark ? '#d1d5db' : '#000000' },
        },
        xAxis: {
          labels: { style: { color: isDark ? '#9ca3af' : '#000000' } },
        },
        yAxis: {
          title: {
            style: { color: isDark ? '#9ca3af' : '#000000' },
          },
          labels: { style: { color: isDark ? '#9ca3af' : '#000000' } },
        },
      }, true);
    }
  }, [isDark]);

  return (
    <div className={`w-full rounded-xl border p-6 transition-colors duration-200 ${
      isDark
        ? "bg-gray-800/50 border-gray-700/50"
        : "bg-white border-gray-200"
    } text-gray-900 dark:text-gray-100`}>
      <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}>Live SIZ Chart</h2>
      <HighchartsReact
        highcharts={Highcharts}
        constructorType="stockChart"
        options={options}
        ref={chartRef}
      />
    </div>
  );
};
