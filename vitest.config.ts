import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  test: {
    environment: "jsdom",
    exclude: ["**/node_modules/**", "**/.next/**", "**/src/tests/e2e/**"],
    globals: false,
    setupFiles: ["./src/tests/setup.ts"],
  },
})
