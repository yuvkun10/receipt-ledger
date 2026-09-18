# Configuration

No environment variables are required for the current app. The tracked `.env.example` documents the safe pattern for future configuration:

- Copy `.env.example` to `.env.local` only when adding local config.
- Keep real `.env`, `.env.local`, and other `.env.*` files out of git.
- Treat every `VITE_` value as public because Vite exposes it in the browser bundle.
- Never store OCR credentials, API keys, bank details, client data, or receipt contents in env files.
