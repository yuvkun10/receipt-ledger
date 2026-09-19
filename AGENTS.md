# AGENTS.md

Receipt Ledger is a browser only React app that parses pasted receipt text into an expense ledger stored in local storage, with CSV export. There is no backend.

## Setup

Node.js 24.x (the CI version) and npm.

```bash
npm ci
```

No environment variables are required. Read [docs/configuration.md](docs/configuration.md) before adding any.

## Commands

```bash
npm run dev    # vite
npm run build  # tsc -b && vite build
npm run lint   # eslint .
npm test       # vitest run
npm audit --audit-level=moderate
npm outdated
```

## Project structure

- `src/App.tsx`, `src/main.tsx`: UI.
- `src/lib/receiptParser.ts`: receipt text parsing.
- `src/lib/expenseAnalytics.ts`: analytics and CSV export.
- `src/lib/expenseStore.ts`: local storage store.
- Tests sit next to the code as `src/lib/*.test.ts`.

Details are in [docs/architecture.md](docs/architecture.md).

## Conventions

- TypeScript `strict`. ESLint with `@eslint/js`, `typescript-eslint`, `react-hooks` and `react-refresh`.
- No formatter or commit convention is enforced. Do not add attribution trailers.

## Testing

Before a PR run lint, test, build, `npm audit --audit-level=moderate` and `npm outdated`. CI runs the same.

## Safety

- Receipt data stays in the browser. Do not add a backend, analytics or network calls without an explicit request.
- Never commit real receipts, exported ledgers or `.env` files.

## More

- [docs/README.md](docs/README.md): docs index
- [docs/privacy-and-security.md](docs/privacy-and-security.md): privacy and security notes
- [docs/maintenance.md](docs/maintenance.md): dependency maintenance
