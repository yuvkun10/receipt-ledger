import type { Expense } from './types';

export const EXPENSE_STORAGE_KEY = 'receipt-ledger-expenses';

export function loadExpenses(storage: Storage): Expense[] {
  const raw = storage.getItem(EXPENSE_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isExpense) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(storage: Storage, expenses: Expense[]): void {
  storage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(expenses));
}

function isExpense(value: unknown): value is Expense {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<Expense>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.merchant === 'string' &&
    typeof candidate.date === 'string' &&
    typeof candidate.category === 'string' &&
    typeof candidate.total === 'number' &&
    Array.isArray(candidate.items)
  );
}
