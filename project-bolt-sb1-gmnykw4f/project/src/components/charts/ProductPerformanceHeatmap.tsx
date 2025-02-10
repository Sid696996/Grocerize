import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { ChartData, ChartOptions } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ProductPerformanceHeatmapProps {
  data: ChartData;
  options?: Partial<ChartOptions>;
}

export default function ProductPerformanceHeatmap({ data, options = {} }: ProductPerformanceHeatmapProps) {
  const defaultOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: true,
      },
      title: {
        display: true,
        text: 'Product Performance Heatmap',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Profit Margin (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Sales Volume',
        },
      },
    },
  };

  return (
    <div className="w-full h-[400px] bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
      <Scatter data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
}