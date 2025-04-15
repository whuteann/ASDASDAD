import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage, FirebaseStorage } from "./storage";
import { insertExpenseSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Helper function to handle errors consistently
const handleApiError = (res: Response, error: any, defaultMessage: string) => {
  console.error('API Error:', error);
  
  if (error instanceof ZodError) {
    const validationError = fromZodError(error);
    return res.status(400).json({ 
      message: validationError.message,
      type: 'VALIDATION_ERROR' 
    });
  }
  
  // Handle Firebase specific errors
  if (error.code) {
    if (error.code === 'permission-denied') {
      return res.status(403).json({ 
        message: 'You don\'t have permission to access this resource',
        type: 'PERMISSION_ERROR'
      });
    }
    
    if (error.code === 'not-found') {
      return res.status(404).json({ 
        message: 'The requested resource was not found',
        type: 'NOT_FOUND_ERROR'
      });
    }
  }
  
  // For all other errors
  return res.status(500).json({ 
    message: error.message || defaultMessage,
    type: 'SERVER_ERROR'
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  
  // Get all expenses
  app.get('/api/expenses', async (req, res) => {
    try {
      const expenses = await storage.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      handleApiError(res, error, 'Failed to fetch expenses');
    }
  });

  // Get expenses by month
  app.get('/api/expenses/month/:year/:month', async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
        return res.status(400).json({ 
          message: 'Invalid year or month',
          type: 'VALIDATION_ERROR'
        });
      }
      
      const expenses = await storage.getExpensesByMonth(year, month);
      res.json(expenses);
    } catch (error) {
      handleApiError(res, error, 'Failed to fetch expenses for the specified month');
    }
  });

  // Get expense by ID
  app.get('/api/expenses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          message: 'Invalid expense ID',
          type: 'VALIDATION_ERROR'
        });
      }
      
      const expense = await storage.getExpenseById(id);
      
      if (!expense) {
        return res.status(404).json({ 
          message: 'Expense not found',
          type: 'NOT_FOUND_ERROR'
        });
      }
      
      res.json(expense);
    } catch (error) {
      handleApiError(res, error, 'Failed to fetch expense');
    }
  });

  // Create new expense
  app.post('/api/expenses', async (req, res) => {
    try {
      console.log('Creating expense:', req.body);
      
      // Validate the request body
      const validatedData = insertExpenseSchema.parse(req.body);
      
      // Create the expense
      const newExpense = await storage.createExpense(validatedData);
      
      console.log('Created expense:', newExpense);
      res.status(201).json(newExpense);
    } catch (error) {
      handleApiError(res, error, 'Failed to create expense');
    }
  });

  // Health check endpoint for Firebase
  app.get('/api/health', (req, res) => {
    const storageType = process.env.FIREBASE_PROJECT_ID ? 'firebase' : 'memory';
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      storage: storageType
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
