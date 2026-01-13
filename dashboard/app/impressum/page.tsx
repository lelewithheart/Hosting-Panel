"use client";

import Script from "next/script";

export default function ImpressumPage() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Legal</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">The following legal content is embedded from our provider.</p>
      <div className="itrk-legaltext" data-itrk-legaltext-url="https://itrk.legal/1u8J.0.13ak-de-iframe.html"></div>
      <Script src="https://www.it-recht-kanzlei.de/js/itrk-legaltext.js" strategy="afterInteractive" />
    </div>
  );
}
