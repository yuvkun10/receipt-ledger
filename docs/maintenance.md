# Dependency maintenance

- GitHub Actions runs install, audit, outdated, lint, tests, and build on pushes to `main` and on pull requests. CI uses Node.js 24.x.
- Dependabot is configured for npm packages and GitHub Actions.
- `npm audit --audit-level=moderate` is the vulnerability gate.
- `npm outdated` is the freshness gate for direct dependencies.
