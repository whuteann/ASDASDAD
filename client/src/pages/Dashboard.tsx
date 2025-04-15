import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MonthFilter from "@/components/MonthFilter";
import ChartViews from "@/components/ChartViews";
import { PieChart, BarChart, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getMonthName, parseDate } from "@/utils/helpers";
import type { Expense } from "@shared/schema";

const Dashboard: React.FC = () => {
  // Get current month and year
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [activeView, setActiveView] = useState("list"); // 'pie', 'bar', or 'list'

  // Fetch expenses for the selected month
  const { data: expensesRaw, isLoading } = useQuery<Expense[]>({
    queryKey: [`${import.meta.env.VITE_FIREBASE_API_KEY}/api/expenses/month`, selectedYear, selectedMonth],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_FIREBASE_API_KEY}/api/expenses/month/${selectedYear}/${selectedMonth}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      return response.json();
    }
  });

  // Process the expenses to ensure dates are properly handled
  const expenses = expensesRaw ? expensesRaw.map(expense => ({
    ...expense,
    createdAt: parseDate(expense.createdAt)
  })) : [];

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  // Format month for display
  const monthDisplay = `${getMonthName(selectedMonth)} ${selectedYear}`;

  return (
    <div className="p-4">
      {/* Month Filter & View Selection */}
      <div className="flex justify-between items-center mb-6">
        <MonthFilter
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={handleMonthChange}
        />
        
        <div className="flex space-x-3">
          <Button
            variant={activeView === "pie" ? "default" : "outline"}
            size="sm"
            onClick={() => handleViewChange("pie")}
            className={`px-3 py-1 text-sm ${activeView === "pie" ? "bg-primary text-black" : "border-primary"}`}
          >
            <PieChart className="h-4 w-4 mr-1" /> Pie
          </Button>
          <Button
            variant={activeView === "bar" ? "default" : "outline"}
            size="sm"
            onClick={() => handleViewChange("bar")}
            className={`px-3 py-1 text-sm ${activeView === "bar" ? "bg-primary text-black" : "border-primary"}`}
          >
            <BarChart className="h-4 w-4 mr-1" /> Bar
          </Button>
          <Button
            variant={activeView === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => handleViewChange("list")}
            className={`px-3 py-1 text-sm ${activeView === "list" ? "bg-primary text-black" : "border-primary"}`}
          >
            <ListOrdered className="h-4 w-4 mr-1" /> List
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      ) : (
        <ChartViews
          expenses={expenses || []}
          activeView={activeView}
          month={monthDisplay}
        />
      )}
    </div>
  );
};

export default Dashboard;
