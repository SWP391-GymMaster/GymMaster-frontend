import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Xuat ban "standalone" -> .next/standalone/server.js, dong goi container nho gon
  // cho Cloud Run (khong phai copy toan bo node_modules).
  output: "standalone",
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ]
  },
};

export default nextConfig;
