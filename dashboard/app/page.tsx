"use client";

import { BRAND_NAME } from "./branding";

export default function Home() {

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-900 dark:text-gray-100">
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to {BRAND_NAME}</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Deploy, manage, and scale your bots. Choose plans per bot, monitor status, and handle billing securely.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/bots" className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Manage Bots</a>
            <a href="/billing" className="inline-flex items-center rounded-md bg-neutral-800 px-4 py-2 text-white hover:bg-neutral-700">Billing & Subscriptions</a>
            <a href="/getting-started" className="inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800">Getting Started</a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="rounded-lg p-5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <h3 className="font-semibold text-lg">Per-Bot Plans</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Buy Nano/Basic/Pro per bot; mix tiers Standard/Premium.</p>
          </div>
          <div className="rounded-lg p-5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <h3 className="font-semibold text-lg">Premium Pool</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Guaranteed resources with hard limits; no overbooking.</p>
          </div>
          <div className="rounded-lg p-5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <h3 className="font-semibold text-lg">Shared Standard</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Soft limits; efficient overbooking for cost savings.</p>
          </div>
        </div>

        {/* Pricing table */}
        <div className="mt-12 space-y-3">
          <h2 className="text-2xl font-semibold">Pricing</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">Choose a plan and tier. Premium provides guaranteed resources; Standard uses shared resources.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Tier */}
            <div className="rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
              <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
                <h3 className="text-xl font-semibold">Standard (Shared)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Shared pool • Soft limits • Best value</p>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded p-3">
                  <h4 className="font-semibold">Nano Standard</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">128 MB RAM</p>
                  <p className="mt-2 font-bold">0.50 € / Monat</p>
                  <a href="/billing" className="mt-2 inline-block bg-blue-600 text-white px-3 py-1 rounded">Buy</a>
                </div>
                <div className="border rounded p-3">
                  <h4 className="font-semibold">Basic Standard</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">256 MB RAM</p>
                  <p className="mt-2 font-bold">1.50 € / Monat</p>
                  <a href="/billing" className="mt-2 inline-block bg-blue-600 text-white px-3 py-1 rounded">Buy</a>
                </div>
                <div className="border rounded p-3">
                  <h4 className="font-semibold">Pro Standard</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">512 MB RAM</p>
                  <p className="mt-2 font-bold">3.00 € / Monat</p>
                  <a href="/billing" className="mt-2 inline-block bg-blue-600 text-white px-3 py-1 rounded">Buy</a>
                </div>
              </div>
            </div>

            {/* Premium Tier */}
            <div className="rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
              <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
                <h3 className="text-xl font-semibold">Premium (Guaranteed)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Guaranteed resources • No overbooking</p>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded p-3">
                  <h4 className="font-semibold">Nano Premium</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">128 MB RAM</p>
                  <p className="mt-2 font-bold">1.50 € / Monat</p>
                  <a href="/billing" className="mt-2 inline-block bg-blue-600 text-white px-3 py-1 rounded">Buy</a>
                </div>
                <div className="border rounded p-3">
                  <h4 className="font-semibold">Basic Premium</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">256 MB RAM</p>
                  <p className="mt-2 font-bold">3.00 € / Monat</p>
                  <a href="/billing" className="mt-2 inline-block bg-blue-600 text-white px-3 py-1 rounded">Buy</a>
                </div>
                <div className="border rounded p-3">
                  <h4 className="font-semibold">Pro Premium</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">512 MB RAM</p>
                  <p className="mt-2 font-bold">6.00 € / Monat</p>
                  <a href="/billing" className="mt-2 inline-block bg-blue-600 text-white px-3 py-1 rounded">Buy</a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <p><strong>Günstigste Option:</strong> Nano Standard → 0.50 €</p>
            <p><strong>Beliebtester Plan:</strong> Basic Standard → 1.50 €</p>
          </div>
        </div>

        <div className="mt-12 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700">
          <div className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Quick CLI</span>
          </div>
          <pre className="code-block">
            <code className="language-bash">
{`# Start a Nano Premium bot
curl -X POST https://api.example.com/bots/start \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{ "botId": 1, "plan": "nano", "tier": "premium" }'

# Buy 3 Basic Standard subscriptions
curl -X POST https://api.example.com/billing/checkout \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{ "plan": "basic", "tier": "standard", "quantity": 3 }'`}
            </code>
          </pre>
        </div>
      </section>
    </div>
  );
}
