# 23 — Package Installation

## 1. Create project

```bash
npx create-next-app@latest gymmaster-frontend --typescript --eslint --app
cd gymmaster-frontend
```

## 2. Setup shadcn/ui

```bash
npx shadcn@latest init
```

Add core components:

```bash
npx shadcn@latest add button input label textarea select checkbox radio-group
npx shadcn@latest add dialog alert-dialog dropdown-menu popover sheet
npx shadcn@latest add table badge card tabs separator skeleton
npx shadcn@latest add form calendar command
```

## 3. Install core packages

```bash
npm install react-hook-form zod @hookform/resolvers
npm install @tanstack/react-query @tanstack/react-table axios
npm install recharts lucide-react sonner date-fns zustand framer-motion
npm install clsx tailwind-merge class-variance-authority
npm install msw
```

## 4. Install testing packages

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D @playwright/test
npx playwright install
```

Optional:

```bash
npm install -D prettier prettier-plugin-tailwindcss
npm install -D @axe-core/playwright
```

## 5. Optional feature packages

```bash
npm install qrcode.react
npm install @zxing/browser
npm install react-dropzone
```

## 6. Recommended scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "quality": "npm run typecheck && npm run lint && npm run test -- --run && npm run test:e2e"
  }
}
```
