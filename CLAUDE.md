# CLAUDE.md - Agent Guidelines

## Build/Test/Lint Commands
- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Build production: `npm run build`
- Run tests: `npm test`
- Run single test: `npm test -- -t "test name"`
- Lint code: `npm run lint`
- Typecheck: `npm run type-check`

## Code Style Guidelines
- **Framework**: Next.js with App Router
- **Formatting**: Prettier with 2-space indentation
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Imports**: Group by: Next.js, React, external libs, components, utils, styles
- **Types**: TypeScript with strict mode; prefer interfaces for object shapes
- **State Management**: React hooks for local state, contexts for shared state
- **Error Handling**: Use try/catch with descriptive errors, Next.js error.tsx
- **File Structure**: One component per file, follow Next.js app/ conventions
- **API**: Use Next.js API routes and server components for backend logic