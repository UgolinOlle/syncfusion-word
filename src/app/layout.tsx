import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "./globals.css";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Word · Wealthcome",
  description: "Implement word with office.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} antialiased bg-background text-foreground dark:bg-[#121212] dark:text-[#f2f2f2]`}
      >
        <Toaster richColors position="top-center" />
        <main className="max-w-7xl h-screen mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
