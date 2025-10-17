/
# Critical Issues Fixes TODO

## 1. Fix Logger Worker Thread Crash
- [x] Replace Pino with worker-thread safe console-based logging in lib/logger.ts
- [x] Ensure all logging functions work without Pino dependency

## 2. Fix ESLint Errors in API Routes
- [x] Remove React hooks from src/app/api/auth/login/route.ts
- [x] Remove React hooks from src/app/api/auth/me/route.ts
- [x] Implement proper authentication logic without hooks

## 3. Fix Require Imports in Scrapers
- [x] Convert require('puppeteer') to ES6 import in lib/scrapers/social-scraper.ts
- [x] Convert require('puppeteer') to ES6 import in lib/scrapers/web-scraper.ts

## 4. Clean Unused Code
- [ ] Search for and remove unused imports across all TypeScript files
- [ ] Remove unused variables and functions (50+ warnings)

## 5. Add Basic Unit Tests
- [x] Create unit tests for logger (lib/logger.ts)
- [ ] Create unit tests for AI providers (lib/ai/providers/)
- [ ] Create unit tests for utilities (lib/utils.ts, lib/validation.ts)
- [ ] Create unit tests for core functions

## 6. Verification
- [ ] Run ESLint to ensure no errors remain
- [ ] Run Vitest to verify tests pass
- [ ] Test application functionality end-to-end
