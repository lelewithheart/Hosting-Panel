"use client";

export default function GettingStartedPage() {
  const API = "/api/bots";
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-300">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Quick Start Guide
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Getting Started</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">Deploy and start your bots in minutes with our simple workflow.</p>
      </div>

      <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Deployment Process
        </h2>
        <ol className="space-y-4">
          {[
            { step: 1, title: "Create Your Bot", desc: "Navigate to 'My Bots' and click the create button to initialize a new bot instance." },
            { step: 2, title: "Prepare Your Code", desc: "Package your bot code as a ZIP file with either your own Dockerfile or let us auto-detect Node.js/Python." },
            { step: 3, title: "Upload & Configure", desc: "Upload your ZIP under 'My Bots → Upload' and configure environment variables if needed." },
            { step: 4, title: "Launch Your Bot", desc: "Click 'Start' to deploy. Monitor status and logs in real-time from your dashboard." },
            { step: 5, title: "Manage & Update", desc: "Edit files under 'Files' section and use 'Restart' to apply changes instantly." },
          ].map((item) => (
            <li key={item.step} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Download Templates</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Start quickly with our pre-configured templates for Node.js and Python.</p>
          <div className="flex flex-col gap-3">
            <a className="group flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-900 dark:from-neutral-800 dark:to-neutral-900 text-white px-5 py-3 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all" href={`${API}/templates/node.zip`}>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Node.js Template</span>
              </div>
              <span className="text-sm text-gray-300 group-hover:text-white">ZIP</span>
            </a>
            <a className="group flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all" href={`${API}/templates/python.zip`}>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Python Template</span>
              </div>
              <span className="text-sm text-blue-200 group-hover:text-white">ZIP</span>
            </a>
          </div>
        </div>

        <div className="rounded-xl border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Pro Tips</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex gap-2 text-sm">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600 dark:text-gray-300">Use your own Dockerfile for full control over the build process and runtime configuration.</span>
            </li>
            <li className="flex gap-2 text-sm">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600 dark:text-gray-300">Ensure your ZIP contains project files at the root level, not nested in a subdirectory.</span>
            </li>
            <li className="flex gap-2 text-sm">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600 dark:text-gray-300">For major code changes, use the 'Files → Restart' workflow for instant updates.</span>
            </li>
            <li className="flex gap-2 text-sm">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600 dark:text-gray-300">Monitor logs regularly to catch and fix issues early in your bot's lifecycle.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Code Examples</h2>
        
        <div className="rounded-xl border-2 border-gray-200 dark:border-neutral-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              <span className="font-semibold">Node.js Example (without Dockerfile)</span>
            </div>
            <button 
              onClick={() => {
                const code = `console.log('Bot running');
setInterval(() => {}, 1000);

# optional package.json
{
  "scripts": { "start": "node index.js" }
}`;
                navigator.clipboard.writeText(code);
                alert('Copied to clipboard!');
              }}
              className="text-xs text-white/80 hover:text-white transition-colors px-3 py-1 rounded bg-white/10 hover:bg-white/20"
            >
              Copy
            </button>
          </div>
          <pre className="code-block"><code>{`index.js

console.log('Bot running');
setInterval(() => {}, 1000);

# optional package.json
{
  "scripts": { "start": "node index.js" }
}`}</code></pre>
        </div>

        <div className="rounded-xl border-2 border-gray-200 dark:border-neutral-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              <span className="font-semibold">Python Example (without Dockerfile)</span>
            </div>
            <button 
              onClick={() => {
                const code = `print('Bot running')
import time
while True:
  time.sleep(1)

# optional requirements.txt
# (empty or with dependencies)`;
                navigator.clipboard.writeText(code);
                alert('Copied to clipboard!');
              }}
              className="text-xs text-white/80 hover:text-white transition-colors px-3 py-1 rounded bg-white/10 hover:bg-white/20"
            >
              Copy
            </button>
          </div>
          <pre className="code-block"><code>{`main.py

print('Bot running')
import time
while True:
  time.sleep(1)

# optional requirements.txt
# (empty or with dependencies)`}</code></pre>
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
            <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Need Help?</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you encounter any issues or have questions about deploying your bot, our support team is here to help. Check the documentation or reach out to us directly.
            </p>
            <div className="flex gap-3">
              <a href="/billing" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                View Plans
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <a href="/impressum" className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border-2 border-gray-300 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors font-medium">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
