import React from "react";
import { Expense, expenseTypeLabels } from "@shared/schema";
import { formatDate, formatCurrency, formatTime } from "@/utils/helpers";

// Category icon mapping
const getCategoryIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    breakfast: "ri-restaurant-line",
    lunch: "ri-restaurant-line",
    dinner: "ri-restaurant-line",
    entertainment: "ri-movie-line",
    transport: "ri-taxi-line",
    medical: "ri-medicine-bottle-line",
    personal_care: "ri-user-heart-line",
    shopping: "ri-shopping-bag-line",
    fitness: "ri-heart-pulse-line",
    hobby: "ri-gamepad-line",
    travel: "ri-plane-line",
    gifts: "ri-gift-line",
    repairs: "ri-tools-line",
    emergency: "ri-alert-line",
    others: "ri-question-line"
  };

  return iconMap[type] || "ri-question-line";
};

// Get color class based on category
const getCategoryColorClass = (type: string): string => {
  const colorMap: Record<string, string> = {
    breakfast: "bg-yellow-100 text-yellow-500",
    lunch: "bg-blue-100 text-blue-500",
    dinner: "bg-yellow-100 text-yellow-500",
    entertainment: "bg-red-100 text-red-500",
    transport: "bg-green-100 text-green-500",
    medical: "bg-red-100 text-red-500",
    personal_care: "bg-purple-100 text-purple-500",
    shopping: "bg-purple-100 text-purple-500",
    fitness: "bg-green-100 text-green-500",
    hobby: "bg-blue-100 text-blue-500",
    travel: "bg-indigo-100 text-indigo-500",
    gifts: "bg-pink-100 text-pink-500",
    repairs: "bg-gray-100 text-gray-500",
    emergency: "bg-red-100 text-red-500",
    others: "bg-gray-100 text-gray-500"
  };

  return colorMap[type] || "bg-gray-100 text-gray-500";
};

// Helper function to ensure date is properly parsed
const parseDate = (dateValue: Date | string): Date => {
  if (typeof dateValue === 'string') {
    return new Date(dateValue);
  }
  return dateValue;
};

interface ExpenseListProps {
  expenses: Expense[];
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses }) => {
  // Group expenses by date
  const expensesByDate: { [key: string]: Expense[] } = {};
  
  expenses.forEach(expense => {
    // Ensure the createdAt is a Date object
    const createdAt = parseDate(expense.createdAt);
    const dateKey = formatDate(createdAt);
    if (!expensesByDate[dateKey]) {
      expensesByDate[dateKey] = [];
    }
    expensesByDate[dateKey].push({
      ...expense,
      createdAt // Replace with parsed date
    });
  });

  // Convert to array of [date, expenses] pairs and sort by date (most recent first)
  const groupedExpenses = Object.entries(expensesByDate)
    .sort(([dateA], [dateB]) => {
      // Parse dates and compare them (most recent first)
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  // Function to generate day header text
  const getDayHeaderText = (dateStr: string): string => {
    const today = formatDate(new Date());
    const yesterday = formatDate(new Date(Date.now() - 86400000)); // 24 hours ago
    
    if (dateStr === today) {
      return "Today";
    } else if (dateStr === yesterday) {
      return "Yesterday";
    } else {
      return dateStr;
    }
  };

  return (
    <div className="divide-y divide-gray-100">
      {groupedExpenses.length === 0 ? (
        <div className="px-4 py-6 text-center text-gray-500">
          No expenses recorded yet
        </div>
      ) : (
        groupedExpenses.map(([date, dayExpenses]) => (
          <div key={date}>
            {/* Day Group Header */}
            <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-600">
              {getDayHeaderText(date)}
            </div>
            
            {/* Expense Items */}
            {dayExpenses.map(expense => (
              <div key={expense.id} className="px-4 py-3 flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${getCategoryColorClass(expense.type)}`}>
                  <i className={`${getCategoryIcon(expense.type)} text-lg`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="font-medium">{expenseTypeLabels[expense.type] || expense.type}</div>
                    <div className="font-semibold">{formatCurrency(expense.amount)}</div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <div className="text-xs text-gray-500">{expense.remarks || '-'}</div>
                    <div className="text-xs text-gray-500">{formatTime(expense.createdAt)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default ExpenseList;
