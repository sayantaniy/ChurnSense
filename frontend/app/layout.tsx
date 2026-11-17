import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChurnSense — Customer Churn",
  description: "Backend-powered customer churn and lifetime value insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}
