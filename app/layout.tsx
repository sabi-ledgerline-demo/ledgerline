import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";

const sourceSans = Source_Sans_3({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Ledgerline",
  description: "Standalone Ledgerline bookkeeping demo"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={sourceSans.className} style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
