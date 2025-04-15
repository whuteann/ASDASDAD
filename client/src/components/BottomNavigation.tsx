import React from "react";
import { useLocation } from "wouter";
import { LayoutDashboard, BarChart2, Plus } from "lucide-react";

const BottomNavigation: React.FC = () => {
  const [location, navigate] = useLocation();

  const handleAddExpense = () => {
    navigate("/add-expense");
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0">
      <div className="flex justify-center relative">
        <button
          className="add-button absolute z-10 w-16 h-16 rounded-full bg-primary text-black shadow-lg flex items-center justify-center transform -translate-y-1/2"
          onClick={handleAddExpense}
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>
      <nav className="flex justify-between bg-white border-t border-gray-200 px-4 pt-2 pb-1">
        <button
          onClick={() => navigateTo("/")}
          className={`flex flex-col items-center px-5 py-2 text-xs font-medium ${location === "/" ? "text-primary" : "text-gray-700"}`}
        >
          <LayoutDashboard className="h-5 w-5 mb-1" />
          <span>Dashboard</span>
        </button>
        <div className="w-16"></div> {/* Empty space for centered button */}
        <button
          onClick={() => navigateTo("/reports")}
          className={`flex flex-col items-center px-5 py-2 text-xs font-medium ${location === "/reports" ? "text-primary" : "text-gray-700"}`}
        >
          <BarChart2 className="h-5 w-5 mb-1" />
          <span>Reports</span>
        </button>
      </nav>
    </div>
  );
};

export default BottomNavigation;
