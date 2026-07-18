import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { config } from "@/lib/config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${config.library.name} Management`,
  description: config.library.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">{children}</div>
      </body>
    </html>
  );
}
