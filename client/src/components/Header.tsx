import React from "react";
import { Settings } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="bg-primary py-4 px-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-textPrimary text-xl font-semibold">Expense Tracker</h1>
        <button className="text-textPrimary p-2 rounded-full hover:bg-primaryDark transition" aria-label="Settings">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
