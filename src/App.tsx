import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  BarChart3,
  CalendarDays,
  Download,
  Pencil,
  Plus,
  ReceiptText,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import { buildCategoryTotals, buildMonthTotals, exportExpensesToCsv, normalizeExpenseInput } from './lib/expenseAnalytics';
import { loadExpenses, saveExpenses } from './lib/expenseStore';
import { parseReceiptText } from './lib/receiptParser';
import type { Expense, ExpenseInput, ReceiptItem } from './lib/types';

const categories = ['Meals', 'Groceries', 'Transport', 'Office', 'Travel', 'Utilities', 'Health', 'Personal', 'Other'];

const sampleReceipt = `Camden Market Grocer
42 Example Street
Date: 05/18/2026
Organic Apples 3.49
Sourdough Loaf 6.50
Coffee Beans 14.99
Subtotal 24.98
Tax 2.25
Total $27.23`;

type DraftExpense = ExpenseInput;

const emptyDraft: DraftExpense = {
  merchant: '',
  date: new Date().toISOString().slice(0, 10),
  category: 'Meals',
  total: 0,
  tax: 0,
  notes: '',
  sourceText: '',
  items: [],
};

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (typeof window === 'undefined') return [];
    return loadExpenses(window.localStorage);
  });
  const [draft, setDraft] = useState<DraftExpense>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [parseMessage, setParseMessage] = useState('Paste a receipt, parse it, then correct any field before saving.');

  const categoryTotals = useMemo(() => buildCategoryTotals(expenses), [expenses]);
  const monthTotals = useMemo(() => buildMonthTotals(expenses), [expenses]);
  const ledgerTotal = useMemo(() => expenses.reduce((sum, expense) => sum + expense.total, 0), [expenses]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveExpenses(window.localStorage, expenses);
    }
  }, [expenses]);

  function updateDraft<K extends keyof DraftExpense>(key: K, value: DraftExpense[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function parseReceipt() {
    const parsed = parseReceiptText(draft.sourceText);
    setDraft((current) => ({
      ...current,
      merchant: parsed.merchant,
      date: parsed.date,
      total: parsed.total,
      tax: parsed.tax ?? current.tax,
      items: parsed.items,
    }));
    setParseMessage(`Parsed ${parsed.items.length} item${parsed.items.length === 1 ? '' : 's'} from the receipt text.`);
  }

  function submitExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const timestamp = new Date().toISOString();
    const normalized = normalizeExpenseInput(draft, timestamp);

    if (editingId) {
      setExpenses((current) =>
        current.map((expense) =>
          expense.id === editingId
            ? {
                ...normalized,
                id: expense.id,
                createdAt: expense.createdAt,
                updatedAt: timestamp,
              }
            : expense,
        ),
      );
      setParseMessage('Expense updated.');
    } else {
      setExpenses((current) => [normalized, ...current]);
      setParseMessage('Expense saved to this browser.');
    }

    resetDraft();
  }

  function resetDraft() {
    setDraft({ ...emptyDraft, date: new Date().toISOString().slice(0, 10) });
    setEditingId(null);
  }

  function editExpense(expense: Expense) {
    setEditingId(expense.id);
    setDraft({
      merchant: expense.merchant,
      date: expense.date,
      category: expense.category,
      total: expense.total,
      tax: expense.tax ?? 0,
      notes: expense.notes,
      sourceText: expense.sourceText,
      items: expense.items,
    });
    setParseMessage(`Editing ${expense.merchant}.`);
  }

  function deleteExpense(id: string) {
    setExpenses((current) => current.filter((expense) => expense.id !== id));
  }

  function exportCsv() {
    const csv = exportExpensesToCsv(expenses);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'receipt-ledger.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  function updateItem(index: number, patch: Partial<ReceiptItem>) {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  }

  function removeItem(index: number) {
    setDraft((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function addItem() {
    setDraft((current) => ({
      ...current,
      items: [...current.items, { name: '', amount: 0 }],
    }));
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyeline">Local expense workspace</p>
          <h1>Receipt Ledger</h1>
        </div>
        <button className="button button-secondary" type="button" onClick={exportCsv} disabled={expenses.length === 0}>
          <Download size={18} aria-hidden="true" />
          Export CSV
        </button>
      </header>

      <section className="metrics-grid" aria-label="Ledger summary">
        <MetricCard label="Expenses" value={expenses.length.toString()} icon={<ReceiptText size={20} />} />
        <MetricCard label="Total logged" value={formatCurrency(ledgerTotal)} icon={<BarChart3 size={20} />} />
        <MetricCard label="This month" value={formatCurrency(monthTotals[0]?.total ?? 0)} icon={<CalendarDays size={20} />} />
      </section>

      <div className="workspace-grid">
        <section className="panel parser-panel" aria-labelledby="parser-heading">
          <div className="section-heading">
            <div>
              <h2 id="parser-heading">Receipt text</h2>
              <p>{parseMessage}</p>
            </div>
            <button className="button button-ghost" type="button" onClick={() => updateDraft('sourceText', sampleReceipt)}>
              <ReceiptText size={17} aria-hidden="true" />
              Sample
            </button>
          </div>
          <textarea
            aria-label="Receipt text"
            value={draft.sourceText}
            onChange={(event) => updateDraft('sourceText', event.target.value)}
            placeholder="Paste receipt text here..."
          />
          <button className="button button-primary" type="button" onClick={parseReceipt} disabled={!draft.sourceText.trim()}>
            <ReceiptText size={18} aria-hidden="true" />
            Parse Receipt
          </button>
        </section>

        <section className="panel" aria-labelledby="correction-heading">
          <div className="section-heading">
            <div>
              <h2 id="correction-heading">{editingId ? 'Update expense' : 'Correct and save'}</h2>
              <p>Review parsed values, assign a category, and adjust line items.</p>
            </div>
            <button className="icon-button" type="button" onClick={resetDraft} aria-label="Reset form">
              <RotateCcw size={18} />
            </button>
          </div>

          <form className="expense-form" onSubmit={submitExpense}>
            <label>
              Merchant
              <input
                value={draft.merchant}
                onChange={(event) => updateDraft('merchant', event.target.value)}
                placeholder="Merchant name"
                required
              />
            </label>

            <div className="form-row">
              <label>
                Date
                <input value={draft.date} onChange={(event) => updateDraft('date', event.target.value)} type="date" required />
              </label>
              <label>
                Category
                <select value={draft.category} onChange={(event) => updateDraft('category', event.target.value)}>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                Total
                <input
                  value={draft.total}
                  onChange={(event) => updateDraft('total', toNumber(event.target.value))}
                  min="0"
                  step="0.01"
                  type="number"
                  required
                />
              </label>
              <label>
                Tax
                <input
                  value={draft.tax ?? 0}
                  onChange={(event) => updateDraft('tax', toNumber(event.target.value))}
                  min="0"
                  step="0.01"
                  type="number"
                />
              </label>
            </div>

            <label>
              Notes
              <input value={draft.notes} onChange={(event) => updateDraft('notes', event.target.value)} placeholder="Optional note" />
            </label>

            <div className="items-header">
              <span>Items</span>
              <button className="button button-ghost" type="button" onClick={addItem}>
                <Plus size={16} aria-hidden="true" />
                Add Item
              </button>
            </div>

            <div className="item-list">
              {draft.items.length === 0 ? (
                <p className="muted">No line items parsed yet.</p>
              ) : (
                draft.items.map((item, index) => (
                  <div className="item-row" key={`${item.name}-${index}`}>
                    <input
                      aria-label={`Item ${index + 1} name`}
                      value={item.name}
                      onChange={(event) => updateItem(index, { name: event.target.value })}
                      placeholder="Item name"
                    />
                    <input
                      aria-label={`Item ${index + 1} amount`}
                      value={item.amount}
                      onChange={(event) => updateItem(index, { amount: toNumber(event.target.value) })}
                      min="0"
                      step="0.01"
                      type="number"
                    />
                    <button className="icon-button danger" type="button" onClick={() => removeItem(index)} aria-label={`Remove item ${index + 1}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <button className="button button-primary" type="submit">
              <Save size={18} aria-hidden="true" />
              {editingId ? 'Save Changes' : 'Save Expense'}
            </button>
          </form>
        </section>
      </div>

      <section className="insights-grid" aria-label="Spending breakdowns">
        <Breakdown title="By category" emptyLabel="Assign categories to see totals">
          {categoryTotals.map((bucket) => (
            <BreakdownRow key={bucket.category} label={bucket.category} count={bucket.count} total={bucket.total} max={categoryTotals[0]?.total ?? 0} />
          ))}
        </Breakdown>
        <Breakdown title="By month" emptyLabel="Save expenses to see monthly totals">
          {monthTotals.map((bucket) => (
            <BreakdownRow key={bucket.month} label={bucket.month} count={bucket.count} total={bucket.total} max={monthTotals[0]?.total ?? 0} />
          ))}
        </Breakdown>
      </section>

      <section className="panel ledger-panel" aria-labelledby="ledger-heading">
        <div className="section-heading">
          <div>
            <h2 id="ledger-heading">Expense ledger</h2>
            <p>{expenses.length === 0 ? 'Saved receipts will appear here.' : `${expenses.length} saved receipt${expenses.length === 1 ? '' : 's'}.`}</p>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="empty-state">
            <ReceiptText size={40} aria-hidden="true" />
            <p>Parse a receipt or enter one manually to begin tracking expenses in this browser.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Total</th>
                  <th>Tax</th>
                  <th>Items</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.date}</td>
                    <td>
                      <strong>{expense.merchant}</strong>
                      {expense.notes ? <span>{expense.notes}</span> : null}
                    </td>
                    <td>{expense.category}</td>
                    <td>{formatCurrency(expense.total)}</td>
                    <td>{formatCurrency(expense.tax ?? 0)}</td>
                    <td>{expense.items.length}</td>
                    <td>
                      <div className="action-group">
                        <button className="icon-button" type="button" onClick={() => editExpense(expense)} aria-label={`Edit ${expense.merchant}`}>
                          <Pencil size={16} />
                        </button>
                        <button className="icon-button danger" type="button" onClick={() => deleteExpense(expense.id)} aria-label={`Delete ${expense.merchant}`}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <article className="metric-card">
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Breakdown({ title, emptyLabel, children }: { title: string; emptyLabel: string; children: ReactNode }) {
  const hasChildren = Boolean(children && (!Array.isArray(children) || children.length > 0));

  return (
    <section className="panel breakdown-panel">
      <h2>{title}</h2>
      {hasChildren ? <div className="breakdown-list">{children}</div> : <p className="muted">{emptyLabel}</p>}
    </section>
  );
}

function BreakdownRow({ label, count, total, max }: { label: string; count: number; total: number; max: number }) {
  const width = max > 0 ? `${Math.max(8, (total / max) * 100)}%` : '0%';

  return (
    <div className="breakdown-row">
      <div>
        <strong>{label}</strong>
        <span>
          {count} receipt{count === 1 ? '' : 's'}
        </span>
      </div>
      <div className="bar-track" aria-hidden="true">
        <span style={{ width }} />
      </div>
      <strong>{formatCurrency(total)}</strong>
    </div>
  );
}

function toNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}
