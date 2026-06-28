# syntax=docker/dockerfile:1
# Next.js (standalone) -> Cloud Run. Build da tang.

# ---- deps: cai dependencies ----
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: build Next ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* duoc INLINE luc build (deu la gia tri PUBLIC, khong phai secret).
# Doi backend/google-client thi sua o day (hoac truyen --build-arg khi build).
ARG NEXT_PUBLIC_API_BASE_URL=https://gymmaster-api-741815287158.asia-southeast1.run.app
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=741815287158-i8shu8ku5j92rpj9eledspfscmpll27d.apps.googleusercontent.com
ARG NEXT_PUBLIC_API_MOCKING=
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_API_MOCKING=$NEXT_PUBLIC_API_MOCKING
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- runner: chay server.js nho gon ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# standalone output: server.js + node_modules toi thieu
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
