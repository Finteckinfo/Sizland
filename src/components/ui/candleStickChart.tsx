'use client';

import React, { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

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
      style: { color: '#d1d5db' },
    },
    xAxis: {
      type: 'datetime',
      labels: { style: { color: '#9ca3af' } },
    },
    yAxis: {
      title: {
        text: 'Price (USD)',
        style: { color: '#9ca3af' },
      },
      labels: { style: { color: '#9ca3af' } },
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

  return (
    <div className="w-full rounded-2xl border border-gray-300 p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      <h2 className="text-xl font-bold mb-4">Live SIZ Chart</h2>
      <HighchartsReact
        highcharts={Highcharts}
        constructorType="stockChart"
        options={options}
        ref={chartRef}
      />
    </div>
  );
};
