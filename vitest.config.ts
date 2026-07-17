import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  test: {
    environment: "jsdom",
    exclude: [
      "**/node_modules/**",
      "**/.next/**",
      "**/src/tests/e2e/**",
      "**/src/tests/e2e-pwa/**",
    ],
    globals: false,
    setupFiles: ["./src/tests/setup.ts"],
  },
})
