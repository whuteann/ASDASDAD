import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  amount: doublePrecision("amount").notNull(),
  type: text("type").notNull(),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define the insertExpenseSchema with explicit typing for remarks
export const insertExpenseSchema = createInsertSchema(expenses)
  .pick({
    amount: true,
    type: true,
    remarks: true,
  })
  .transform((data) => ({
    ...data,
    remarks: data.remarks ?? null // Ensure remarks is always string | null
  }));

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// Category type for dropdown options
export const expenseTypes = [
  "breakfast",
  "lunch",
  "dinner",
  "entertainment",
  "transport",
  "medical",
  "personal_care",
  "shopping",
  "fitness",
  "hobby",
  "travel",
  "gifts",
  "repairs",
  "emergency",
  "others"
] as const;

export const expenseTypeLabels: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  entertainment: "Entertainment",
  transport: "Transport",
  medical: "Medical",
  personal_care: "Personal Care",
  shopping: "Shopping",
  fitness: "Fitness/Wellness",
  hobby: "Hobby",
  travel: "Travel",
  gifts: "Gifts",
  repairs: "Repairs/Maintenance",
  emergency: "Emergency",
  others: "Others",
};
