import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "TeamSync – Organization Hub",
  description: "Set up meetings, manage team updates, upload documents, and track daily tasks.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
