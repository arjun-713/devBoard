---
trigger: always_on
---

# DevBoard — Agent Rules

## Code Quality
- TypeScript strict mode everywhere — no `any`, no `// @ts-ignore`
- No default exports except page components
- All components: named exports
- Path aliases: always use `@/` instead of relative `../../`
- Never import directly from `react` for types — use `import type`

## State Rules (NON-NEGOTIABLE)
- Redux Toolkit = server state only (tasks, boards, auth user)
- Zustand = UI state only (modals, sidebar, toasts)
- Never put loading/error state in Zustand
- Never put modal open/close state in Redux
- Async thunks in `store/slices/` — not inside components

## Styling Rules
- Tailwind only — no inline styles, no CSS modules, no styled-components
- Follow the DevBoard design system from `.agents/skills/devboard-ui/SKILL.md`
- Dark theme only — never add light mode variants unless explicitly asked
- No arbitrary Tailwind values outside the design system tokens

## API / Backend Rules
- All API calls go through `api/client.ts` (the Axios instance) — never raw fetch
- Controllers stay thin — no business logic, just req/res handling
- Always validate request body in routes with express-validator or zod
- JWT middleware on all protected routes — never trust client-sent user IDs

## File Organization
- New component → create the file in the correct folder per architecture in GEMINI.md
- New route → create controller + route file + register in app.ts
- New Redux state → create a slice in `store/slices/`

## Git
- Commit messages: `feat:`, `fix:`, `chore:`, `refactor:` prefixes
- Never commit `.env` files
- Feature branches off `main`, PR back to `main`