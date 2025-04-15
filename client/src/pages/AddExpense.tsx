import React from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import ExpenseForm from "@/components/ExpenseForm";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertExpense } from "@shared/schema";

const AddExpense: React.FC = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Create expense mutation
  const mutation = useMutation({
    mutationFn: async (data: InsertExpense) => {
      const response = await fetch(`${import.meta.env.VITE_FIREBASE_API_KEY}/api/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create expense');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: [`${import.meta.env.VITE_FIREBASE_API_KEY}/api/expenses`] });
      queryClient.invalidateQueries({ queryKey: [`${import.meta.env.VITE_FIREBASE_API_KEY}/api/expenses/month`] });
      
      // Show success toast
      toast({
        title: "Expense added",
        description: "Your expense has been successfully recorded.",
        duration: 3000,
      });
      
      // Navigate back to dashboard
      navigate("/");
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Error",
        description: error.message || "Failed to add expense. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleSubmit = (data: InsertExpense) => {
    mutation.mutate(data);
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <button 
          className="p-2 rounded-full hover:bg-gray-100" 
          onClick={handleBackToHome}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold ml-2">Add Expense</h2>
      </div>

      <ExpenseForm 
        onSubmit={handleSubmit as any} 
        isSubmitting={mutation.isPending} 
      />
    </div>
  );
};

export default AddExpense;
