import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Child Compass™",
  description: "Understand your child. Navigate life together.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
