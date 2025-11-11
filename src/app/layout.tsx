import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "NETKRIDA Finance System",
  description: "Sistem manajemen keuangan terintegrasi untuk NETKRIDA",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body style={{ cursor: "auto" }}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
