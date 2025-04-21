"use client";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatisticItem {
  label: string;
  value: number;
  color?: string;
}

interface StatisticCardProps {
  title?: string;
  items: StatisticItem[];
  showChart?: boolean;
  className?: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({
  title = "Statistics",
  items = [],
  showChart = true,
  className = "",
}) => {
  // Default colors if not provided
  const defaultColors = [
    "#FF6384", // red
    "#36A2EB", // blue
    "#FFCE56", // yellow
    "#4BC0C0", // teal
    "#9966FF", // purple
  ];

  // Prepare chart data
  const chartData = {
    labels: items.map((item) => item.label),
    datasets: [
      {
        data: items.map((item) => item.value),
        backgroundColor: items.map(
          (item, index) =>
            item.color || defaultColors[index % defaultColors.length]
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw as number;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div
      className={`w-full flex flex-col bg-secondary rounded-lg shadow p-6 font-poppins items-center ${className}`}
    >
      {title && (
        <h3 className="text-lg font-medium text-white mb-4">{title}</h3>
      )}

      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
        {showChart && items.length > 0 && (
          <div className="w-[140px]">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        )}

        <div className="w-full space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center">
                {showChart && (
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{
                      backgroundColor:
                        item.color ||
                        defaultColors[index % defaultColors.length],
                    }}
                  />
                )}
                <span className="text-sm font-medium text-white">
                  {item.label}
                </span>
              </div>
              <span className="text-lg font-semibold text-white">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticCard;
