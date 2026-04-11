import type { Metadata } from "next";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saqqara LLC - Artist-Driven Beauty & Wellness Platform",
  description: "Empowering holistic and cosmetic service providers with tools for visibility, promotion, and client engagement.",
  keywords: "beauty, wellness, artists, booking, platform, services",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0A0A0A" />
      </head>
      <body className="bg-saqqara-dark text-saqqara-light">
        {/* Global background watermark */}
        <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden">
          <div className="relative w-[480px] h-[480px] opacity-[0.04]">
            <img
              src="/assets/assets/logo/saqqara-logo.svg"
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
