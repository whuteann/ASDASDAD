import { firestore } from '../firebase';
import { InsertExpense, Expense } from '@shared/schema';

// Let's create some type definitions for our emulated Firestore
interface EmulatedDocumentSnapshot {
  id: string;
  exists: boolean;
  data: () => any;
}

// Define Error types
interface FirebaseError extends Error {
  code?: string;
  message: string;
}

const COLLECTION_NAME = 'expenses';
const expensesCollection = firestore.collection(COLLECTION_NAME);

// Initialize the counter document if it doesn't exist
const initializeCounterIfNeeded = async () => {
  try {
    const counterRef = firestore.collection('counters').doc('expenses');
    const doc = await counterRef.get();
    
    if (!doc.exists) {
      await counterRef.set({ value: 0 });
      console.log('Initialized expense counter');
    }
  } catch (error: any) {
    console.error('Error initializing counter:', error);
  }
};

// Call this function to ensure the counter exists
initializeCounterIfNeeded();

/**
 * Get the next ID using a counter document
 */
const getNextId = async (): Promise<number> => {
  const counterRef = firestore.collection('counters').doc('expenses');
  
  // Use a transaction to safely increment the counter
  const result = await firestore.runTransaction(async (transaction: any) => {
    const counterDoc = await transaction.get(counterRef);
    
    if (!counterDoc.exists) {
      transaction.set(counterRef, { value: 1 });
      return 1;
    }
    
    const newValue = (counterDoc.data()?.value || 0) + 1;
    transaction.update(counterRef, { value: newValue });
    return newValue;
  });
  
  return result;
};

/**
 * Converts a Firestore document to an Expense object
 * Works with both real Firestore docs and our emulated ones
 */
const convertToExpense = (doc: any): Expense => {
  try {
    const data = doc.data();
    if (!data) throw new Error('Document does not exist');
    
    // Handle potential date format issues
    let createdAtDate: Date;
    if (data.createdAt instanceof Date) {
      createdAtDate = data.createdAt;
    } else if (typeof data.createdAt === 'string') {
      createdAtDate = new Date(data.createdAt);
    } else if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      // Handle Firebase Timestamp objects
      createdAtDate = data.createdAt.toDate();
    } else {
      // Default to now if completely invalid
      console.warn(`Invalid date format for expense ${doc.id}, using current date`);
      createdAtDate = new Date();
    }
    
    return {
      id: parseInt(doc.id),
      amount: Number(data.amount),
      type: String(data.type),
      remarks: data.remarks || null,
      createdAt: createdAtDate
    };
  } catch (error: any) {
    console.error(`Error converting document ${doc.id}:`, error);
    throw new Error(`Failed to convert expense document: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Creates a new expense in Firestore
 */
export const createExpense = async (expense: InsertExpense): Promise<Expense> => {
  try {
    // Get the next ID using our counter
    const nextId = await getNextId();
    
    // Create the expense document with the ID
    const createdAt = new Date();
    const docRef = expensesCollection.doc(nextId.toString());
    
    const expenseData = {
      amount: expense.amount,
      type: expense.type,
      remarks: expense.remarks || null,
      createdAt
    };
    
    await docRef.set(expenseData);
    
    console.log(`Created expense with ID: ${nextId}`);
    
    // Return the created expense
    return {
      id: nextId,
      ...expenseData
    };
  } catch (error: any) {
    console.error('Error creating expense:', error);
    throw new Error(`Failed to create expense: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Gets all expenses from Firestore
 */
export const getAllExpenses = async (): Promise<Expense[]> => {
  try {
    const snapshot = await expensesCollection.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(convertToExpense);
  } catch (error: any) {
    console.error('Error getting all expenses:', error);
    throw new Error(`Failed to get expenses: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Gets an expense by ID from Firestore
 */
export const getExpenseById = async (id: number): Promise<Expense | undefined> => {
  try {
    const docRef = expensesCollection.doc(id.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) return undefined;
    return convertToExpense(doc);
  } catch (error: any) {
    console.error(`Error getting expense with ID ${id}:`, error);
    throw new Error(`Failed to get expense: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Gets expenses by date range from Firestore
 */
export const getExpensesByDateRange = async (startDate: Date, endDate: Date): Promise<Expense[]> => {
  try {
    const snapshot = await expensesCollection
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(convertToExpense);
  } catch (error: any) {
    console.error(`Error getting expenses by date range:`, error);
    
    // If the error is due to index not existing, log a helpful message
    if (error.code === 'failed-precondition') {
      console.error('This query requires an index. Follow the link in the Firebase console to create it.');
    }
    
    throw new Error(`Failed to get expenses by date range: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Gets expenses by month from Firestore
 */
export const getExpensesByMonth = async (year: number, month: number): Promise<Expense[]> => {
  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    console.log(`Fetching expenses for ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    return getExpensesByDateRange(startDate, endDate);
  } catch (error: any) {
    console.error(`Error getting expenses for month ${month}/${year}:`, error);
    throw new Error(`Failed to get expenses for month: ${error.message || 'Unknown error'}`);
  }
};