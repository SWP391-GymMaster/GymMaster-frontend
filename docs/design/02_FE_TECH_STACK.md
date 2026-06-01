# 02 — Frontend Tech Stack

> Repo-local status: Frontend target implementation guide derived from `docs/init/`. Packages listed here are target dependencies, not necessarily installed. Check `package.json` and `docs/implementation/package-tooling-audit.md` for current implementation evidence.

## 1. Stack chính thức

| Layer | Technology | Vai trò |
|---|---|---|
| Framework | Next.js | App Router, routing, SSR/CSR khi cần |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first styling |
| UI System | shadcn/ui | Component system dựa trên Radix + Tailwind |
| Form | React Hook Form | Quản lý form state |
| Validation | Zod | Schema validation |
| Server State | TanStack Query | Fetch/cache/mutation/invalidation |
| Table | TanStack Table | Table logic |
| Chart | Recharts | Dashboard charts |
| Icons | Lucide React | Icon system |
| Toast | Sonner | Toast notification |
| Date | date-fns | Format/parse date |
| Client State | Zustand | UI state nhỏ |
| Motion | Framer Motion | Motion nhẹ |
| Component Test | Vitest + React Testing Library | Test component/form/permission |
| E2E Test | Playwright | Test critical demo flow |
| API Mock | MSW | Mock API trong test/dev |
| Latest docs | Context7 | Cung cấp docs mới nhất cho AI prompt |
| Spec workflow | GitHub Spec Kit | Spec → Plan → Tasks → Implement |

---

## 2. Core packages

```bash
npm install react-hook-form zod @hookform/resolvers
npm install @tanstack/react-query @tanstack/react-table axios
npm install recharts lucide-react sonner date-fns zustand framer-motion
npm install msw
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D @playwright/test
```

## 3. shadcn/ui components cần add sớm

```bash
npx shadcn@latest init

npx shadcn@latest add button input label textarea select checkbox radio-group
npx shadcn@latest add dialog alert-dialog dropdown-menu popover sheet
npx shadcn@latest add table badge card tabs separator skeleton
npx shadcn@latest add form calendar command
```

Dùng Sonner riêng cho toast:

```bash
npm install sonner
```

## 4. Optional packages

| Package | Khi nào dùng |
|---|---|
| `qrcode.react` | Hiển thị QR cho Member check-in |
| `@zxing/browser` | Scan QR/barcode bằng camera |
| `react-dropzone` | Upload progress photo hoặc meal image enhancement |
| `@axe-core/playwright` | Optional accessibility check trong Playwright |
| `prettier-plugin-tailwindcss` | Tự sort Tailwind class |

## 5. Package không khuyến nghị trong MVP

| Package | Lý do |
|---|---|
| Redux Toolkit | Không cần nếu server state dùng TanStack Query và UI state dùng Zustand |
| MUI + shadcn cùng lúc | Dễ rối design system |
| Ant Design | Dễ tạo cảm giác template, khó đồng bộ với Tailwind/shadcn |
| FullCalendar | Chỉ cần nếu booking trở thành core |
| ECharts | Overkill cho dashboard MVP |
| Moment.js | Dùng date-fns nhẹ hơn |
