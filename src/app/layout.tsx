import { Providers } from "@/components/providers/Providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fantastats - Yahoo Fantasy Basketball",
  description: "Your Yahoo Fantasy Basketball companion - stats, matchups, and streaming insights",
  icons: {
    icon: [
      { url: "/brand/logo-icon.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/app-icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/brand/app-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
