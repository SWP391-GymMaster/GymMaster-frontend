import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Xuat ban "standalone" -> .next/standalone/server.js, dong goi container nho gon
  // cho Cloud Run (khong phai copy toan bo node_modules).
  output: "standalone",
};

export default nextConfig;
