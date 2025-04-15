import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MonthFilter from "@/components/MonthFilter";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, PieChart } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { getMonthName, formatCurrency, parseDate } from "@/utils/helpers";
import { Expense, expenseTypeLabels } from "@shared/schema";

const Reports: React.FC = () => {
  // Get current month and year
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Fetch expenses for the selected month
  const { data: expensesRaw, isLoading } = useQuery<Expense[]>({
    queryKey: [`${import.meta.env.VITE_FIREBASE_API_KEY}/api/expenses/mont`, selectedYear, selectedMonth],
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

  // Format month for display
  const monthDisplay = `${getMonthName(selectedMonth)} ${selectedYear}`;

  // Calculate statistics
  const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

  // Group expenses by category
  const expensesByCategory = expenses?.reduce<Record<string, number>>((acc, expense) => {
    const category = expense.type;
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {}) || {};

  // Group expenses by day for bar chart
  const getDailyExpenses = (expenses: Expense[] = []) => {
    const dailyMap: Record<number, number> = {};
    
    expenses.forEach(expense => {
      const day = expense.createdAt.getDate();
      dailyMap[day] = (dailyMap[day] || 0) + expense.amount;
    });
    
    // Create array of all days in month with expenses
    const result: [string, number][] = [];
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      if (dailyMap[i]) {
        result.push([i.toString(), dailyMap[i]]);
      }
    }
    
    return result;
  };

  const dailyExpenses = getDailyExpenses(expenses);

  // Prepare chart data
  const pieData = {
    labels: Object.keys(expensesByCategory).map(key => expenseTypeLabels[key] || key),
    values: Object.values(expensesByCategory),
  };

  const barData = {
    labels: dailyExpenses.map(([day]) => day),
    values: dailyExpenses.map(([_, amount]) => amount),
  };

  return (
    <div className="p-4">
      {/* Month Filter */}
      <div className="flex justify-between items-center mb-6">
        <MonthFilter
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={handleMonthChange}
        />
        
        <div className="text-sm text-gray-500">
          {monthDisplay}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      ) : (
        <>
          {/* Total Card */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="text-sm text-gray-500">Monthly Total</h3>
              <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
            </CardContent>
          </Card>

          {/* Expense Distribution */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4">Expense Distribution</h2>
              <div className="mb-4 h-64">
                {Object.keys(expensesByCategory).length > 0 ? (
                  <PieChart
                    labels={pieData.labels}
                    datasets={[
                      {
                        data: pieData.values,
                        backgroundColor: [
                          '#3B82F6', // blue
                          '#10B981', // green
                          '#F59E0B', // yellow
                          '#EF4444', // red
                          '#8B5CF6', // purple
                          '#EC4899', // pink
                          '#14B8A6', // teal
                          '#F97316', // orange
                        ],
                      },
                    ]}
                    height="250px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No expense data for this month
                  </div>
                )}
              </div>

              {/* Top Categories */}
              <h3 className="text-md font-medium mt-6 mb-2">Top Categories</h3>
              <div className="space-y-2">
                {Object.entries(expensesByCategory)
                  .sort(([_, a], [__, b]) => b - a)
                  .slice(0, 3)
                  .map(([category, amount], index) => (
                    <div key={category} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{index + 1}. {expenseTypeLabels[category] || category}</span>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(amount)}</span>
                    </div>
                  ))}

                {Object.keys(expensesByCategory).length === 0 && (
                  <div className="text-gray-500 text-sm">No categories to display</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Daily Expenses Chart */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4">Daily Expenses</h2>
              <div className="h-64">
                {dailyExpenses.length > 0 ? (
                  <BarChart
                    labels={barData.labels}
                    datasets={[
                      {
                        label: 'Daily Expenses',
                        data: barData.values,
                        backgroundColor: '#9bd4e4',
                      },
                    ]}
                    height="250px"
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No daily data for this month
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Reports;
