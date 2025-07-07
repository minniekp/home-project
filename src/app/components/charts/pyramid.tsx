import React, { useRef, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import type { Chart as ChartJS } from 'chart.js';
import Chart from 'chart.js/auto'; // Chart.js v3+ required for react-chartjs-2 v3+

interface PyramidChartProps {
  chartData: any; // Replace 'any' with the actual type if known (e.g., ChartData<'bar'>)
}
const PyramidChart: React.FC<PyramidChartProps> = ({ chartData }) => {

  const chartRef = useRef<Chart | null>(null);

  // Chart options (mirroring your Vue chartOptions)
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      y: {
        stacked: true,
        display: false,
        barPercentage: 1.1,
        ticks: {
          beginAtZero: true,
          // Add other tick options here if needed, or leave as is for default behavior
        } as any, // Type assertion to bypass strict type checks
      },
      x: {
        stacked: true,
        display: false,
      },
    },
  };

  // Update chart when chartData changes (like Vue's watch)
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [chartData]);

  return (
    <div style={{ height: '25%', width: '25%' }}>
     <Bar ref={chartRef as any} data={chartData} options={chartOptions} />
    </div>
  );
};

export default PyramidChart;