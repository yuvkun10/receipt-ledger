# Privacy and security notes

- Receipt data stays in the browser's local storage for the current device and browser profile.
- The app has no backend, database, analytics SDK, or built in network upload path for receipt contents.
- Clearing site data, switching browsers, or using private browsing can remove saved ledger entries.
- Exported CSV files may contain merchant names, dates, notes, item names, tax, and totals. Store and share exports as financial records.
- Do not paste secrets, card numbers, full account numbers, health details, or client sensitive information unless you are comfortable storing that text locally in the browser.
- If future OCR APIs or sync features are added, document the provider, retention behavior, access controls, and required env variables before enabling them.
