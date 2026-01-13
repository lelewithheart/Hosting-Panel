"use client";

import { usePathname } from "next/navigation";
import { BRAND_NAME } from "../branding";

export default function Sidebar() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <aside className="w-64 bg-gray-900 text-white p-6">
      <h1 className="text-xl font-bold mb-6">{BRAND_NAME}</h1>
      <nav className="space-y-4">
        <a href="/" className="block hover:text-gray-300 dark:hover:text-gray-200">Home</a>
        <a href="/bots" className="block hover:text-gray-300 dark:hover:text-gray-200">My Bots</a>
        <a href="/bots/files" className="block hover:text-gray-300 dark:hover:text-gray-200">Files</a>
        <a href="/getting-started" className="block hover:text-gray-300 dark:hover:text-gray-200">Getting Started</a>
        <a href="/billing" className="block hover:text-gray-300 dark:hover:text-gray-200">Billing</a>
        <a href="/impressum" className="block hover:text-gray-300 dark:hover:text-gray-200">Legal</a>
        <button
          onClick={async () => {
            try {
              await fetch("/api/auth/logout", { method: "POST" });
            } catch {}
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="block w-full text-left hover:text-gray-300 dark:hover:text-gray-200"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
