import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./auth/context";
import Sidebar from "./components/Sidebar";
import ThemeToggle from "./components/ThemeToggle";
import { BRAND_NAME, BRAND_TAGLINE } from "./branding";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: BRAND_TAGLINE,
  applicationName: BRAND_NAME,
  openGraph: {
    title: BRAND_NAME,
    description: BRAND_TAGLINE,
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const showBanner = process.env.NEXT_PUBLIC_MAINTENANCE === "true";
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex h-screen bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100`}>
        <AuthProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <header className="flex items-center justify-end p-4 border-b border-gray-200 dark:border-neutral-800">
              <ThemeToggle />
            </header>
            {showBanner && (
              <div role="status" className="bg-amber-100 dark:bg-amber-900/60 border-y border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100">
                <div className="px-4 py-3 text-sm font-medium flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  Maintenance: We are currently fixing some issues. Services are paused today.
                </div>
              </div>
            )}
            <main className="flex-1 p-8 overflow-y-auto">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
