import type { CategoryTotal, Expense, ExpenseInput, MonthTotal } from './types';

export function buildCategoryTotals(expenses: Expense[]): CategoryTotal[] {
  return [...groupTotals(expenses, (expense) => expense.category || 'Uncategorized').entries()]
    .map(([category, bucket]) => ({ category, ...bucket }))
    .sort((left, right) => right.total - left.total || left.category.localeCompare(right.category));
}

export function buildMonthTotals(expenses: Expense[]): MonthTotal[] {
  return [...groupTotals(expenses, (expense) => expense.date.slice(0, 7)).entries()]
    .map(([month, bucket]) => ({ month, ...bucket }))
    .sort((left, right) => right.month.localeCompare(left.month));
}

export function normalizeExpenseInput(input: ExpenseInput, timestamp: string): Expense {
  return {
    id: createExpenseId(timestamp),
    merchant: input.merchant.trim() || 'Unknown merchant',
    date: input.date,
    category: input.category.trim() || 'Uncategorized',
    total: roundCurrency(input.total),
    tax: roundCurrency(input.tax ?? 0),
    notes: input.notes.trim(),
    sourceText: input.sourceText,
    items: input.items
      .map((item) => ({ name: item.name.trim(), amount: roundCurrency(item.amount) }))
      .filter((item) => item.name && Number.isFinite(item.amount)),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function exportExpensesToCsv(expenses: Expense[]): string {
  const header = ['Date', 'Merchant', 'Category', 'Total', 'Tax', 'Items', 'Notes'];
  const rows = expenses.map((expense) => [
    expense.date,
    expense.merchant,
    expense.category,
    formatCurrency(expense.total),
    formatCurrency(expense.tax ?? 0),
    expense.items.map((item) => `${item.name}: ${formatCurrency(item.amount)}`).join('; '),
    expense.notes,
  ]);

  return [header, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}

function groupTotals(expenses: Expense[], getKey: (expense: Expense) => string): Map<string, { count: number; total: number }> {
  return expenses.reduce((totals, expense) => {
    const key = getKey(expense);
    const current = totals.get(key) ?? { count: 0, total: 0 };
    totals.set(key, {
      count: current.count + 1,
      total: roundCurrency(current.total + expense.total),
    });
    return totals;
  }, new Map<string, { count: number; total: number }>());
}

function createExpenseId(timestamp: string): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `expense-${timestamp.replace(/\D/g, '')}`;
}

function formatCurrency(amount: number): string {
  return roundCurrency(amount).toFixed(2);
}

function escapeCsvCell(value: string): string {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
