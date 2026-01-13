"use client";

import { BRAND_NAME } from "./branding";

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 text-gray-900 dark:from-neutral-900 dark:via-blue-950/20 dark:to-neutral-900 dark:text-gray-100">
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="space-y-6 animate-fadeIn">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Hosting Panel v2.0
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-gray-100 dark:via-blue-400 dark:to-gray-100 bg-clip-text text-transparent">
            Welcome to {BRAND_NAME}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
            Deploy, manage, and scale your bots with ease. Choose flexible plans, monitor real-time status, and handle billing securely—all in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/bots" className="group inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-all hover:shadow-lg hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Manage Bots
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a href="/billing" className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all hover:shadow-lg hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              Billing & Plans
            </a>
            <a href="/getting-started" className="group inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 dark:border-neutral-700 px-6 py-3 font-medium hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all hover:shadow-md hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Getting Started
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="group rounded-xl p-6 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg">Per-Bot Plans</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Buy Nano/Basic/Pro per bot; mix tiers Standard/Premium for ultimate flexibility.</p>
          </div>
          <div className="group rounded-xl p-6 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg">Premium Pool</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Guaranteed resources with hard limits; no overbooking for consistent performance.</p>
          </div>
          <div className="group rounded-xl p-6 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:shadow-xl hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg">Shared Standard</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Soft limits with efficient overbooking for maximum cost savings.</p>
          </div>
        </div>

        {/* Pricing table */}
        <div className="mt-12 space-y-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-base text-gray-600 dark:text-gray-300 mt-2">Choose a plan and tier. Premium provides guaranteed resources; Standard uses shared resources.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Standard Tier */}
            <div className="relative rounded-2xl border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
                <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold mb-3">BEST VALUE</div>
                <h3 className="text-2xl font-bold">Standard (Shared)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Shared pool • Soft limits • Cost-effective</p>
              </div>
              <div className="p-6 grid grid-cols-1 gap-4">
                <div className="group border-2 border-gray-200 dark:border-neutral-700 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">Nano Standard</h4>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-semibold">Popular</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold">0.50 €</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">/ month</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      128 MB RAM
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Perfect for small bots
                    </div>
                  </div>
                  <a href="/billing" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">Select Plan</a>
                </div>
                <div className="border-2 border-gray-200 dark:border-neutral-700 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200">
                  <h4 className="font-bold text-lg mb-2">Basic Standard</h4>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold">1.50 €</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">/ month</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      256 MB RAM
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Great for most bots
                    </div>
                  </div>
                  <a href="/billing" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">Select Plan</a>
                </div>
                <div className="border-2 border-gray-200 dark:border-neutral-700 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200">
                  <h4 className="font-bold text-lg mb-2">Pro Standard</h4>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold">3.00 €</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">/ month</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      512 MB RAM
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Power users
                    </div>
                  </div>
                  <a href="/billing" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">Select Plan</a>
                </div>
              </div>
            </div>

            {/* Premium Tier */}
            <div className="relative rounded-2xl border-2 border-purple-300 dark:border-purple-700 bg-white dark:bg-neutral-800 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
                <div className="inline-block px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-xs font-semibold mb-3">GUARANTEED</div>
                <h3 className="text-2xl font-bold">Premium (Guaranteed)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Dedicated resources • No overbooking</p>
              </div>
              <div className="p-6 grid grid-cols-1 gap-4">
                <div className="border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg transition-all duration-200">
                  <h4 className="font-bold text-lg mb-2">Nano Premium</h4>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold">1.50 €</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">/ month</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      128 MB RAM (guaranteed)
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Consistent performance
                    </div>
                  </div>
                  <a href="/billing" className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">Select Plan</a>
                </div>
                <div className="border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg transition-all duration-200">
                  <h4 className="font-bold text-lg mb-2">Basic Premium</h4>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold">3.00 €</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">/ month</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      256 MB RAM (guaranteed)
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Production-ready
                    </div>
                  </div>
                  <a href="/billing" className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">Select Plan</a>
                </div>
                <div className="border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg transition-all duration-200">
                  <h4 className="font-bold text-lg mb-2">Pro Premium</h4>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold">6.00 €</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">/ month</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      512 MB RAM (guaranteed)
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Maximum reliability
                    </div>
                  </div>
                  <a href="/billing" className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">Select Plan</a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Günstigste Option</p>
                  <p className="text-gray-600 dark:text-gray-300">Nano Standard → 0.50 € / month</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Beliebtester Plan</p>
                  <p className="text-gray-600 dark:text-gray-300">Basic Standard → 1.50 € / month</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-neutral-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="px-5 py-3 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-white">Quick Start CLI</span>
            </div>
            <button 
              onClick={() => {
                const code = document.querySelector('.code-block code')?.textContent;
                if (code) {
                  try {
                    navigator.clipboard.writeText(code);
                    // Success - could be replaced with toast notification in future
                  } catch (err) {
                    console.error('Failed to copy:', err);
                  }
                }
              }}
              className="flex items-center gap-1 text-xs text-gray-300 hover:text-white transition-colors px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
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
