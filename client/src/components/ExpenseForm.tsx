import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { expenseTypes, expenseTypeLabels, insertExpenseSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Create form schema with validation based on insertExpenseSchema
const formSchema = z.object({
  amount: z.preprocess(
    // Convert string input to number
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "Amount must be a number" })
      .positive("Amount must be greater than 0")
      .min(0.01, "Amount must be at least 0.01")
  ),
  type: z.enum(expenseTypes as unknown as [string, ...string[]], {
    invalid_type_error: "Please select a category",
  }),
  remarks: z.string().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, isSubmitting }) => {
  // Set up form with default values
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      type: undefined,
      remarks: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white p-5 rounded-lg shadow-sm">
        {/* Amount Input */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="mb-5">
              <FormLabel className="text-sm font-medium text-gray-700">Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <Input
                    placeholder="0.00"
                    className="pl-8 w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:ring-2"
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value));
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type Dropdown */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="mb-5">
              <FormLabel className="text-sm font-medium text-gray-700">Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full p-3 border border-gray-300 rounded-md">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {expenseTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {expenseTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remarks Input */}
        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel className="text-sm font-medium text-gray-700">Remarks</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add notes about this expense (optional)"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:ring-2"
                  rows={3}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primaryDark text-textPrimary font-medium py-3 px-4 rounded-md transition"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Expense"}
        </Button>
      </form>
    </Form>
  );
};

export default ExpenseForm;
