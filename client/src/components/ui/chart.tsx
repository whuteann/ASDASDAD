import * as React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// Common chart options
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

interface ChartProps {
  labels: string[];
  datasets: ChartDataset[];
  height?: string;
  options?: any;
}

export function BarChart({ labels, datasets, height = "250px", options = {} }: ChartProps) {
  const data = {
    labels,
    datasets: datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || "hsl(var(--primary))",
      borderColor: dataset.borderColor || "hsl(var(--primary-foreground))",
      borderWidth: dataset.borderWidth || 1,
    })),
  };

  return (
    <div style={{ height, position: "relative" }}>
      <Bar data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
}

export function PieChart({ labels, datasets, height = "250px", options = {} }: ChartProps) {
  const data = {
    labels,
    datasets: datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || [
        "#3B82F6", // blue
        "#10B981", // green
        "#F59E0B", // yellow
        "#EF4444", // red
        "#8B5CF6", // purple
        "#EC4899", // pink
        "#14B8A6", // teal
        "#F97316", // orange
      ],
      borderWidth: dataset.borderWidth || 1,
    })),
  };

  return (
    <div style={{ height, position: "relative" }}>
      <Pie data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
}

export function DoughnutChart({ labels, datasets, height = "250px", options = {} }: ChartProps) {
  const data = {
    labels,
    datasets: datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || [
        "#3B82F6", // blue
        "#10B981", // green
        "#F59E0B", // yellow
        "#EF4444", // red
        "#8B5CF6", // purple
        "#EC4899", // pink
        "#14B8A6", // teal
        "#F97316", // orange
      ],
      borderWidth: dataset.borderWidth || 1,
    })),
  };

  return (
    <div style={{ height, position: "relative" }}>
      <Doughnut data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
}

export function LineChart({ labels, datasets, height = "250px", options = {} }: ChartProps) {
  const data = {
    labels,
    datasets: datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || "rgba(155, 212, 228, 0.2)",
      borderColor: dataset.borderColor || "hsl(var(--primary))",
      borderWidth: dataset.borderWidth || 2,
      fill: dataset.fill !== undefined ? dataset.fill : false,
    })),
  };

  return (
    <div style={{ height, position: "relative" }}>
      <Line data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
}
