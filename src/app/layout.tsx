import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/app/providers";

const interSans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: "GymMaster",
  description: "Frontend quản lý vận hành phòng gym GymMaster.",
  icons: {
    icon: "/assets/gymmaster/gymmaster-mark.svg",
    apple: "/icons/gymmaster-192.png",
  },
  openGraph: {
    images: ["/assets/gymmaster/gym-operations-cover.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={cn("h-full", "antialiased", interSans.variable, geistMono.variable)}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
