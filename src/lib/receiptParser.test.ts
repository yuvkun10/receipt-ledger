import { describe, expect, it } from 'vitest';
import { parseReceiptText } from './receiptParser';

describe('parseReceiptText', () => {
  it('extracts merchant, ISO date, subtotal, tax, total, and line items from pasted receipt text', () => {
    const parsed = parseReceiptText(`
      Camden Market Grocer
      42 Example Street
      Date: 05/18/2026
      Organic Apples 3.49
      Sourdough Loaf 6.50
      Coffee Beans 14.99
      Subtotal 24.98
      Tax 2.25
      Total $27.23
      Visa **** 1000
    `);

    expect(parsed).toEqual({
      merchant: 'Camden Market Grocer',
      date: '2026-05-18',
      subtotal: 24.98,
      tax: 2.25,
      total: 27.23,
      items: [
        { name: 'Organic Apples', amount: 3.49 },
        { name: 'Sourdough Loaf', amount: 6.5 },
        { name: 'Coffee Beans', amount: 14.99 },
      ],
    });
  });

  it('handles receipts with alternate date and amount labels', () => {
    const parsed = parseReceiptText(`
      NORTHSIDE PHARMACY
      Purchased: 2026-04-02
      Bandages $5.40
      Hand Soap $3.95
      VAT: $0.84
      Amount Due: $10.19
    `);

    expect(parsed.merchant).toBe('NORTHSIDE PHARMACY');
    expect(parsed.date).toBe('2026-04-02');
    expect(parsed.tax).toBe(0.84);
    expect(parsed.total).toBe(10.19);
    expect(parsed.items).toEqual([
      { name: 'Bandages', amount: 5.4 },
      { name: 'Hand Soap', amount: 3.95 },
    ]);
  });
});
