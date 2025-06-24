"use client";

import { useVendors } from '../context/VendorContext';
import { getVendorStats } from './vendorStatsUtil';
import { useMemo } from 'react';
import AnimatedCounter from './AnimatedCounter';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);


import { useTheme } from '../utils/ThemeContext';
import { FaUsers } from 'react-icons/fa';

export default function DashboardPage() {
  const { vendors, loading } = useVendors();
  const { isDark } = useTheme();

  const vendorStats = useMemo(() => getVendorStats(vendors), [vendors]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
        <div className="text-xl font-semibold">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-6 px-2 md:px-8 transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>

      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className={`rounded-lg shadow-md p-6 flex flex-col items-center ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-black'}`}>
          <span className="text-4xl mb-2"><FaUsers /></span>
          <div className="text-lg font-semibold mb-1">Total Vendors</div>
                    <AnimatedCounter value={vendorStats.total} />
        </div>
        <div className={`rounded-lg shadow-md p-6 flex flex-col items-center ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-black'}`}>
          <span className="text-4xl mb-2">✅</span>
          <div className="text-lg font-semibold mb-1">Active Vendors</div>
                    <AnimatedCounter value={vendorStats.active} />
        </div>
        <div className={`rounded-lg shadow-md p-6 flex flex-col items-center ${isDark ? 'bg-slate-800 text-red-300' : 'bg-white text-black'}`}>
          <span className="text-4xl mb-2">⛔</span>
          <div className="text-lg font-semibold mb-1">Inactive Vendors</div>
                    <AnimatedCounter value={vendorStats.inactive} />
        </div>
      </div>
      {/* Modern Animated Pie Chart */}
      <div className="flex justify-center mb-8 mt-16">
        <div className="w-full max-w-xs sm:max-w-md md:max-w-lg">
          <Pie
            data={{
              labels: ['Active Vendors', 'Inactive Vendors'],
              datasets: [
                {
                  data: [vendorStats.active, vendorStats.inactive],
                  backgroundColor: [
                    'rgba(56, 189, 248, 0.85)', // blue
                    'rgba(251, 113, 133, 0.85)', // pink/red
                  ],
                  borderColor: [
                    'rgba(56, 189, 248, 1)',
                    'rgba(251, 113, 133, 1)',
                  ],
                  borderWidth: 0,
                  hoverBackgroundColor: [
                    'rgba(56, 189, 248, 1)',
                    'rgba(251, 113, 133, 1)',
                  ],
                  hoverBorderColor: '#ffffff',
                  hoverBorderWidth: 2,
                  borderRadius: 10,
                  spacing: 6,
                  offset: 6,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '60%',
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom',
                  labels: {
                    color: isDark ? '#e5e7eb' : '#64748b',
                    font: { size: 14, weight: 'bold' },
                  },
                },
                tooltip: {
                  enabled: true,
                  backgroundColor: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(15,23,42,0.95)',
                  titleColor: isDark ? '#fff' : '#fff',
                  bodyColor: isDark ? '#e5e7eb' : '#fff',
                  titleFont: { size: 16, weight: 'bold' },
                  bodyFont: { size: 14 },
                  padding: 12,
                  cornerRadius: 8,
                  borderColor: '#fff',
                  borderWidth: 1,
                  displayColors: false,
                  callbacks: {
                    label: (context) => {
                      const label = context.label || '';
                      const value = Number(context.raw) || 0;
                      const dataArr = Array.isArray(context.dataset.data) ? context.dataset.data : [];
                      const total = dataArr.reduce((acc: number, curr: unknown) => acc + Number(curr), 0);
                      const percentage = total ? Math.round((value / total) * 100) : 0;
                      return `${label}: ${value} (${percentage}%)`;
                    },
                  },
                },
              },
              animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1200,
                easing: 'easeOutCirc',
              },
              elements: {
                arc: { borderWidth: 0 },
              },
            }}
            height={220}
          />
        </div>
      </div>
    </div>
  );
}
