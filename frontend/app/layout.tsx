import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChurnSense — ML Churn Prediction & LTV Dashboard",
  description: "Customer Churn Prediction and Lifetime Value (LTV) Estimation System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#1E293B] font-['Work_Sans',sans-serif] antialiased">
        {children}
      </body>
    </html>
  );
}
