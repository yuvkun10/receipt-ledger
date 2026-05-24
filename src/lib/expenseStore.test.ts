import { describe, expect, it } from 'vitest';
import { loadExpenses, saveExpenses } from './expenseStore';
import type { Expense } from './types';

class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

const expense: Expense = {
  id: 'exp-1',
  merchant: 'Camden Market Grocer',
  date: '2026-05-18',
  category: 'Groceries',
  total: 27.23,
  tax: 2.25,
  notes: 'weekly shop',
  sourceText: 'receipt',
  items: [{ name: 'Organic Apples', amount: 3.49 }],
  createdAt: '2026-05-18T10:00:00.000Z',
  updatedAt: '2026-05-18T10:00:00.000Z',
};

describe('expenseStore', () => {
  it('persists and restores expenses from local storage', () => {
    const storage = new MemoryStorage();

    saveExpenses(storage, [expense]);

    expect(loadExpenses(storage)).toEqual([expense]);
  });

  it('returns an empty ledger when stored data is invalid', () => {
    const storage = new MemoryStorage();
    storage.setItem('receipt-ledger-expenses', '{bad json');

    expect(loadExpenses(storage)).toEqual([]);
  });
});
