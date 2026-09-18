# Receipt Ledger

Receipt Ledger is a browser app that turns pasted receipt or OCR text into an expense ledger. It parses merchant, date, totals, tax and line items, lets you correct them, stores expenses in browser local storage, and exports CSV. It is aimed at freelancers, small business owners and bookkeepers who want receipt tracking that stays on their machine. The app works today and has no backend.

## Installation

Prerequisites:

- Node.js 24.x (the version CI uses)
- npm

```bash
npm ci
```

No environment variables are required. See [docs/configuration.md](docs/configuration.md) before adding any.

## Usage

```bash
npm run dev      # Start the Vite development server
npm run build    # Type-check and build the production bundle
```

Open the local Vite URL printed by the dev server. Extract text from a receipt with your own OCR tool, paste it into the app, review the parsed fields, save the expense, and export the ledger as CSV when needed.

This repository has no deployment configuration. `npm run build` writes a static bundle to `dist`.

## Project structure

```text
├── .github
│   ├── dependabot.yml
│   └── workflows
│       └── ci.yml
├── docs
│   ├── architecture.md
│   └── archive
├── src
│   ├── lib
│   │   ├── expenseAnalytics.ts
│   │   ├── expenseStore.ts
│   │   ├── receiptParser.ts
│   │   └── types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── .env.example
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Details are in [docs/architecture.md](docs/architecture.md).

## Coding style

ESLint runs with the `@eslint/js` and `typescript-eslint` recommended configs plus the `react-hooks` and `react-refresh` plugins (`eslint.config.js`). TypeScript runs in `strict` mode. No formatter or commit convention is configured.

```bash
npm run lint     # Run ESLint
npm run build    # Includes the tsc type check
```

## Test

```bash
npm test         # Run Vitest once
```

The tests cover the receipt parser, the expense analytics and CSV export, and the local storage store (`src/lib/*.test.ts`). CI also runs these dependency gates:

```bash
npm audit --audit-level=moderate
npm outdated
```

## Documentation

- [Documentation index](docs/README.md)
- [Overview, use cases and features](docs/overview.md)
- [Architecture](docs/architecture.md)
- [Configuration](docs/configuration.md)
- [Privacy and security notes](docs/privacy-and-security.md)
- [Dependency maintenance](docs/maintenance.md)

## License

MIT. See [LICENSE](LICENSE).
