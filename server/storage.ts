import { type Expense, type InsertExpense } from "@shared/schema";
import * as expenseService from './services/expense.service';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });
// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  
  // Expense related methods
  createExpense(expense: InsertExpense): Promise<Expense>;
  getAllExpenses(): Promise<Expense[]>;
  getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]>;
  getExpenseById(id: number): Promise<Expense | undefined>;
  getExpensesByMonth(year: number, month: number): Promise<Expense[]>;
}

// Firebase implementation of storage
export class FirebaseStorage implements IStorage {
  private users: Map<number, any>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  // User methods - still using in-memory for now
  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Expense methods - using Firebase
  async createExpense(expense: InsertExpense): Promise<Expense> {
    return expenseService.createExpense(expense);
  }

  async getAllExpenses(): Promise<Expense[]> {
    return expenseService.getAllExpenses();
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return expenseService.getExpensesByDateRange(startDate, endDate);
  }

  async getExpenseById(id: number): Promise<Expense | undefined> {
    return expenseService.getExpenseById(id);
  }

  async getExpensesByMonth(year: number, month: number): Promise<Expense[]> {
    return expenseService.getExpensesByMonth(year, month);
  }
}

// For development/testing - if Firebase credentials aren't available, fall back to in-memory storage
export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private expenses: Map<number, Expense>;
  currentId: number;
  currentExpenseId: number;

  constructor() {
    this.users = new Map();
    this.expenses = new Map();
    this.currentId = 1;
    this.currentExpenseId = 1;
  }

  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.currentExpenseId++;
    const createdAt = new Date();
    const expense: Expense = { 
      id, 
      amount: insertExpense.amount,
      type: insertExpense.type,
      remarks: insertExpense.remarks || null,
      createdAt 
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async getAllExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => 
        expense.createdAt >= startDate && expense.createdAt <= endDate
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getExpenseById(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async getExpensesByMonth(year: number, month: number): Promise<Expense[]> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    return this.getExpensesByDateRange(startDate, endDate);
  }
}

// Export Firebase storage if environment variables are set, otherwise use in-memory storage
console.log("This should be the project id: ", process.env.FIREBASE_PROJECT_ID);
const hasFirebaseConfig = !!process.env.FIREBASE_PROJECT_ID;
export const storage = hasFirebaseConfig ? new FirebaseStorage() : new MemStorage();

console.log(`Using ${hasFirebaseConfig ? 'Firebase' : 'in-memory'} storage`);
