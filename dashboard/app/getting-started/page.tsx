export default function GettingStartedPage() {
  const API = "/api/bots";
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Getting Started: Deploy and start bots</h1>
      <p className="text-gray-700">Host your bot in a few steps.</p>

      <ol className="list-decimal pl-6 space-y-2">
        <li>Go to “My Bots” and create a new bot.</li>
        <li>Prepare your code as a ZIP. You have two options:
          <ul className="list-disc pl-6">
            <li>Own Dockerfile inside the ZIP (recommended) — full control.</li>
            <li>No Dockerfile — we detect Node/Python and automatically generate a suitable Dockerfile.</li>
          </ul>
        </li>
        <li>Upload the ZIP under “My Bots → Upload”.</li>
        <li>Start the bot. Check status and logs.</li>
        <li>Edit files under “Files” and use “Restart” to apply changes.</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-6">Templates</h2>
      <div className="flex gap-3">
        <a className="bg-gray-800 text-white px-4 py-2 rounded" href={`${API}/templates/node.zip`}>Node Template (ZIP)</a>
        <a className="bg-gray-800 text-white px-4 py-2 rounded" href={`${API}/templates/python.zip`}>Python Template (ZIP)</a>
      </div>

      <h2 className="text-2xl font-semibold mt-6">Node (without Dockerfile)</h2>
      <pre className="code-block text-sm overflow-auto"><code>{`index.js

console.log('Bot running');
setInterval(() => {}, 1000);

# optional package.json
{
  "scripts": { "start": "node index.js" }
}
`}</code></pre>

        <h2 className="text-2xl font-semibold mt-6">Python (without Dockerfile)</h2>
        <pre className="code-block text-sm overflow-auto"><code>{`main.py

    print('Bot running')
    import time
    while True:
      time.sleep(1)

    # optional requirements.txt
    # (leer oder mit libs)
    `}</code></pre>

      <h2 className="text-2xl font-semibold mt-6">Tips</h2>
      <ul className="list-disc pl-6">
        <li>Prefer your own Dockerfile (port mappings, processes, etc.).</li>
        <li>The ZIP should contain the project root, not just a named folder.</li>
        <li>For major changes: use “Files → Restart”.</li>
      </ul>
    </div>
  );
}
