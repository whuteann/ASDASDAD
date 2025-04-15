// Helper functions for formatting and data manipulation

// Parse date to ensure it's a Date object
export const parseDate = (dateValue: Date | string): Date => {
  if (typeof dateValue === 'string') {
    return new Date(dateValue);
  }
  return dateValue;
};

// Format currency amount
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format date to human-readable format (e.g., "September 21, 2023")
export const formatDate = (date: Date | string): string => {
  const d = parseDate(date);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

// Format time (e.g., "2:30 PM")
export const formatTime = (date: Date | string): string => {
  const d = parseDate(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Get month name from month index (0-11)
export const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
};

// Group expenses by date
export const groupExpensesByDate = (expenses: any[]): { [key: string]: any[] } => {
  const grouped: { [key: string]: any[] } = {};
  
  expenses.forEach(expense => {
    const dateKey = formatDate(expense.createdAt);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    // Ensure createdAt is a Date object
    grouped[dateKey].push({
      ...expense,
      createdAt: parseDate(expense.createdAt)
    });
  });
  
  return grouped;
};

// Calculate total expenses for an array of expenses
export const calculateTotal = (expenses: any[]): number => {
  return expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
};

// Check if a date is today
export const isToday = (date: Date | string): boolean => {
  const d = parseDate(date);
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};

// Check if a date is yesterday
export const isYesterday = (date: Date | string): boolean => {
  const d = parseDate(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
};
