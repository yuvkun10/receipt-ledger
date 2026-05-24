export type ReceiptItem = {
  name: string;
  amount: number;
};

export type ParsedReceipt = {
  merchant: string;
  date: string;
  subtotal?: number;
  tax?: number;
  total: number;
  items: ReceiptItem[];
};

export type Expense = ParsedReceipt & {
  id: string;
  category: string;
  notes: string;
  sourceText: string;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseInput = {
  merchant: string;
  date: string;
  category: string;
  total: number;
  tax?: number;
  notes: string;
  sourceText: string;
  items: ReceiptItem[];
};

export type TotalBucket = {
  total: number;
  count: number;
};

export type CategoryTotal = TotalBucket & {
  category: string;
};

export type MonthTotal = TotalBucket & {
  month: string;
};
