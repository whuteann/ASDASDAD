import React from "react";
import { BarChart, PieChart } from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";
import ExpenseList from "@/components/ExpenseList";
import { Expense, expenseTypeLabels } from "@shared/schema";
import { formatCurrency } from "@/utils/helpers";

interface ChartViewsProps {
  expenses: Expense[];
  activeView: string;
  month: string;
}

// Helper function to ensure date is properly parsed
const parseDate = (dateValue: Date | string): Date => {
  if (typeof dateValue === 'string') {
    return new Date(dateValue);
  }
  return dateValue;
};

const ChartViews: React.FC<ChartViewsProps> = ({ expenses, activeView, month }) => {
  // Group expenses by category for pie chart
  const expensesByCategory = expenses.reduce<{ [key: string]: number }>((acc, expense) => {
    const category = expense.type;
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});

  const pieChartData = {
    labels: Object.keys(expensesByCategory).map(key => expenseTypeLabels[key] || key),
    values: Object.values(expensesByCategory),
  };

  // Group expenses by date for bar chart (last 7 days)
  const getDaysInMonth = (expenses: Expense[]) => {
    const days = expenses.reduce<{ [key: string]: number }>((acc, expense) => {
      // Ensure createdAt is a Date object
      const date = parseDate(expense.createdAt);
      const day = date.getDate();
      acc[day.toString()] = (acc[day.toString()] || 0) + expense.amount;
      return acc;
    }, {});

    // Sort by day (number)
    return Object.entries(days)
      .sort(([dayA], [dayB]) => parseInt(dayA) - parseInt(dayB))
      .slice(-7); // Last 7 days with expenses
  };

  const dailyExpenses = getDaysInMonth(expenses);
  
  const barChartData = {
    labels: dailyExpenses.map(([day]) => day),
    values: dailyExpenses.map(([_, amount]) => amount),
  };

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="mb-6">
      {/* Total Expenses Card */}
      <Card className="bg-white shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="text-sm text-gray-500">Total Expenses</div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">{formatCurrency(totalExpenses)}</span>
            <span className="ml-2 text-sm text-gray-500">{month}</span>
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart View */}
      <div className={`${activeView === 'pie' ? 'block' : 'hidden'}`}>
        <Card className="bg-white shadow-sm mb-4">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3">Expense Distribution</h2>
            <PieChart
              labels={pieChartData.labels}
              datasets={[
                {
                  data: pieChartData.values,
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
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {Object.entries(expensesByCategory).map(([category, amount], index) => {
                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
                return (
                  <div key={category} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    ></div>
                    <span className="text-sm">{expenseTypeLabels[category] || category}</span>
                    <span className="text-sm font-medium ml-auto">{formatCurrency(amount)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart View */}
      <div className={`${activeView === 'bar' ? 'block' : 'hidden'}`}>
        <Card className="bg-white shadow-sm mb-4">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3">Daily Expenses</h2>
            <BarChart
              labels={barChartData.labels}
              datasets={[
                {
                  label: 'Daily Expenses',
                  data: barChartData.values,
                  backgroundColor: '#9bd4e4',
                },
              ]}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* List View */}
      <div className={`${activeView === 'list' ? 'block' : 'hidden'}`}>
        <Card className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold">Expense History</h2>
          </div>
          <ExpenseList expenses={expenses} />
        </Card>
      </div>
    </div>
  );
};

export default ChartViews;
