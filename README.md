# Receipt Ledger

Receipt Ledger is a local-first web app for turning pasted receipt text into tracked expenses. It extracts common receipt fields, lets you correct the results, stores expenses in browser local storage, summarizes spending, and exports a CSV ledger.

## Features

- Paste receipt text and parse merchant, date, total, tax, subtotal, and line items.
- Correct parsed fields before saving.
- Assign categories and add notes.
- Edit or delete saved expenses.
- View totals by category and calendar month.
- Persist data in local storage.
- Export the ledger as CSV.

## Tech Stack

- React
- Vite
- TypeScript
- Vitest
- ESLint

## Getting Started

```bash
npm ci
npm run dev
```

## Verification

```bash
npm run lint
npm test
npm run build
```
