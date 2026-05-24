import { describe, expect, it } from 'vitest';
import {
  buildCategoryTotals,
  buildMonthTotals,
  exportExpensesToCsv,
  normalizeExpenseInput,
} from './expenseAnalytics';
import type { Expense } from './types';

const expenses: Expense[] = [
  {
    id: 'exp-1',
    merchant: 'Camden Market Grocer',
    date: '2026-05-18',
    category: 'Groceries',
    total: 27.23,
    tax: 2.25,
    notes: 'weekly shop',
    sourceText: 'receipt one',
    items: [{ name: 'Organic Apples', amount: 3.49 }],
    createdAt: '2026-05-18T10:00:00.000Z',
    updatedAt: '2026-05-18T10:00:00.000Z',
  },
  {
    id: 'exp-2',
    merchant: 'Metro',
    date: '2026-05-19',
    category: 'Transport',
    total: 8.5,
    tax: 0,
    notes: '',
    sourceText: 'receipt two',
    items: [],
    createdAt: '2026-05-19T10:00:00.000Z',
    updatedAt: '2026-05-19T10:00:00.000Z',
  },
  {
    id: 'exp-3',
    merchant: 'Corner Shop',
    date: '2026-04-30',
    category: 'Groceries',
    total: 14.1,
    tax: 1.15,
    notes: '',
    sourceText: 'receipt three',
    items: [],
    createdAt: '2026-04-30T10:00:00.000Z',
    updatedAt: '2026-04-30T10:00:00.000Z',
  },
];

describe('expense analytics', () => {
  it('groups spending by category and keeps deterministic ordering', () => {
    expect(buildCategoryTotals(expenses)).toEqual([
      { category: 'Groceries', count: 2, total: 41.33 },
      { category: 'Transport', count: 1, total: 8.5 },
    ]);
  });

  it('groups spending by calendar month in descending month order', () => {
    expect(buildMonthTotals(expenses)).toEqual([
      { month: '2026-05', count: 2, total: 35.73 },
      { month: '2026-04', count: 1, total: 14.1 },
    ]);
  });

  it('normalizes manual corrections into a durable expense record', () => {
    expect(
      normalizeExpenseInput(
        {
          merchant: '  Camden Market Grocer ',
          date: '2026-05-18',
          category: 'Groceries',
          total: 27.234,
          tax: 2.251,
          notes: '  weekly shop ',
          sourceText: 'raw text',
          items: [{ name: '  Organic Apples ', amount: 3.494 }],
        },
        '2026-05-20T12:00:00.000Z',
      ),
    ).toMatchObject({
      merchant: 'Camden Market Grocer',
      date: '2026-05-18',
      category: 'Groceries',
      total: 27.23,
      tax: 2.25,
      notes: 'weekly shop',
      sourceText: 'raw text',
      items: [{ name: 'Organic Apples', amount: 3.49 }],
      createdAt: '2026-05-20T12:00:00.000Z',
      updatedAt: '2026-05-20T12:00:00.000Z',
    });
  });

  it('exports expenses as escaped CSV rows', () => {
    const withCommaAndQuote: Expense[] = [
      {
        ...expenses[0],
        merchant: 'Camden Market, Grocer',
        notes: 'owner said "urgent"',
      },
    ];

    expect(exportExpensesToCsv([...expenses, ...withCommaAndQuote])).toBe(
      [
        'Date,Merchant,Category,Total,Tax,Items,Notes',
        '2026-05-18,Camden Market Grocer,Groceries,27.23,2.25,Organic Apples: 3.49,weekly shop',
        '2026-05-19,Metro,Transport,8.50,0.00,,',
        '2026-04-30,Corner Shop,Groceries,14.10,1.15,,',
        '2026-05-18,"Camden Market, Grocer",Groceries,27.23,2.25,Organic Apples: 3.49,"owner said ""urgent"""',
      ].join('\n'),
    );
  });
});
