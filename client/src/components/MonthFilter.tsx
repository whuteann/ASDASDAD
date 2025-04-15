import React from "react";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MonthFilterProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
}

const MonthFilter: React.FC<MonthFilterProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
}) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate options for the last 2 years
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1];
  
  const options = yearOptions.flatMap(year => 
    months.map((month, index) => ({
      value: `${year}-${index}`,
      label: `${month} ${year}`
    }))
  );

  const handleChange = (value: string) => {
    const [year, month] = value.split('-').map(Number);
    onMonthChange(month, year);
  };

  return (
    <Select
      value={`${selectedYear}-${selectedMonth}`}
      onValueChange={handleChange}
    >
      <SelectTrigger className="bg-white border border-gray-300 text-textPrimary rounded-md h-10 w-40">
        <SelectValue placeholder="Select month" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MonthFilter;
