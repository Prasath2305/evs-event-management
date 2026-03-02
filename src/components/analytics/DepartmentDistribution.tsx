// src/components/analytics/DepartmentDistribution.tsx
'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DepartmentDistributionProps {
  data: { name: string; events: number; participants: number }[];
}

export function DepartmentDistribution({ data }: DepartmentDistributionProps) {
  const chartData = {
    labels: data.map(d => d.name),
    datasets: [
      {
        data: data.map(d => d.events),
        backgroundColor: [
          '#059669',
          '#d97706',
          '#0284c7',
          '#dc2626',
          '#7c3aed',
          '#db2777',
          '#4b5563',
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Events by Department',
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}