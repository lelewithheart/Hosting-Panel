"use client";

import { useAuth } from "../auth/context";
import { useEffect, useState } from "react";

export default function BillingPage() {
  const { user } = useAuth();
  const [tier, setTier] = useState("standard");
  const [plan, setPlan] = useState("basic");
  const [quantity, setQuantity] = useState(1);
  const [entitlements, setEntitlements] = useState<Record<string, number>>({});
  const [subscriptions, setSubscriptions] = useState<Array<{id:number, plan:string, quantity:number}>>([]);
  const [reqRequirements, setReqRequirements] = useState("");
  const [reqBudget, setReqBudget] = useState("");
  const [reqTimeframe, setReqTimeframe] = useState("");
  const [reqStatus, setReqStatus] = useState<string | null>(null);
  const [reqLoading, setReqLoading] = useState(false);
  const [priceMap, setPriceMap] = useState<Record<string, { unit_amount?: number, currency?: string }>>({});
  const [availability, setAvailability] = useState<Array<{kind:string; sku:string; tier:string|null; total:number; assigned:number; available:number;}>>([]);
  const [assignments, setAssignments] = useState<Array<{botId:number; kind:string; sku:string; tier:string|null; quantity:number;}>>([]);
  const [bots, setBots] = useState<Array<{id:number; name?:string; plan?:string}>>([]);
  const [assignForm, setAssignForm] = useState<Record<string, { botId?: number; quantity?: number }>>({});
  const [assignLoading, setAssignLoading] = useState(false);
  const adMailTo = "mailto:owner@example.com?subject=Ad%20placement%20inquiry";
  const adSlots = [
    {
      title: "Leaderboard",
      size: "1200 x 160",
      price: "€120 / month",
      blurb: "Full-width hero placement shown to every signed-in user.",
      accent: "from-blue-500/20 via-indigo-500/20 to-purple-500/20",
    },
    {
      title: "Sidebar Skyscraper",
      size: "300 x 600",
      price: "€90 / month",
      blurb: "Tall slot beside navigation for persistent visibility.",
      accent: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
    },
    {
      title: "Inline Banner",
      size: "728 x 90",
      price: "€60 / month",
      blurb: "Appears between dashboard sections and lists.",
      accent: "from-amber-500/20 via-orange-500/20 to-rose-500/20",
    },
    {
      title: "Footer Bar",
      size: "970 x 90",
      price: "€40 / month",
      blurb: "Lightweight reminder at the end of every page.",
      accent: "from-slate-500/20 via-gray-500/20 to-neutral-500/20",
    },
  ];

  const checkoutUpgrade = async (payload: { kind: "ram" | "qol" | "one_time"; sku: string; tier?: "standard" | "premium"; quantity?: number; }) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Not authenticated");
    const res = await fetch("/api/billing/checkout-upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data?.url) {
      window.location.href = data.url;
    } else {
      alert(data?.error || "Checkout failed");
    }
  };

  useEffect(() => {
    const loadSummary = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("/api/billing/summary", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setEntitlements(data.entitlements || {});
        setSubscriptions(data.subscriptions || []);
        setAvailability(data.availability || []);
        setAssignments((data.assignments || []).map((a: any) => ({
          botId: Number(a.botId),
          kind: a.kind,
          sku: a.sku,
          tier: a.tier ?? null,
          quantity: a.quantity || 1,
        })));
        const form: Record<string, { botId?: number; quantity?: number }> = {};
        (data.availability || []).forEach((a: any) => {
          const key = `${a.kind}:${a.sku}:${a.tier || ""}`;
          form[key] = { quantity: 1 };
        });
        setAssignForm(form);
      } catch {}
    };
    const loadPrices = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("/api/billing/prices", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        const map: Record<string, { unit_amount?: number, currency?: string }> = {};
        if (data?.prices) {
          Object.entries<any>(data.prices).forEach(([k, v]: any) => {
            if (v && !v.error) map[k] = { unit_amount: v.unit_amount, currency: v.currency };
          });
        }
        setPriceMap(map);
      } catch {}
    };
    const loadBots = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("/api/bots/list", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setBots(Array.isArray(data?.bots) ? data.bots : []);
      } catch {}
    };
    loadSummary();
    loadPrices();
    loadBots();
  }, []);
  const fmt = (key: string, fallback: string) => {
    const p = priceMap[key];
    if (!p?.unit_amount || !p.currency) return fallback;
    const amount = (p.unit_amount / 100).toFixed(2).replace(".00", ".00");
    const cur = p.currency.toUpperCase();
    // Assume EUR for display symbol
    const sym = cur === "EUR" ? "€" : cur + " ";
    return `${amount} ${sym}`;
  };

  const subscribe = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan, tier, quantity }),
    });
    const data = await res.json();
    if (res.ok && data?.url) {
      window.location.href = data.url;
    } else {
      alert(data?.error || "Checkout failed");
    }
  };

  const assignUpgrade = async (entry: { kind: string; sku: string; tier: string | null }) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Not authenticated");
    const key = `${entry.kind}:${entry.sku}:${entry.tier || ""}`;
    const cfg = assignForm[key] || {};
    if (!cfg.botId) return alert("Select a bot");
    const qty = Number(cfg.quantity || 0);
    if (Number.isNaN(qty) || qty < 0) return alert("Invalid quantity");
    setAssignLoading(true);
    try {
      const res = await fetch("/api/billing/assign-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ botId: cfg.botId, kind: entry.kind, sku: entry.sku, tier: entry.tier, quantity: qty }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Assign failed");
      } else {
        // refresh availability and assignments
        const summaryRes = await fetch("/api/billing/summary", { headers: { Authorization: `Bearer ${token}` } });
        const summary = await summaryRes.json();
        setAvailability(summary.availability || []);
        setAssignments((summary.assignments || []).map((a: any) => ({ botId: Number(a.botId), kind: a.kind, sku: a.sku, tier: a.tier ?? null, quantity: a.quantity || 1 })));
      }
    } catch (e) {
      alert("Assign failed");
    } finally {
      setAssignLoading(false);
    }
  };

  const cancel = async (subscriptionId: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/billing/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ subscriptionId }),
    });
    if (res.ok) {
      const sres = await fetch("/api/billing/summary", { headers: { Authorization: `Bearer ${token}` } });
      const sdata = await sres.json();
      setEntitlements(sdata.entitlements || {});
      setSubscriptions(sdata.subscriptions || []);
    } else {
      alert("Cancel failed");
    }
  };

  const submitCustomRequest = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setReqLoading(true);
    setReqStatus(null);
    try {
      const res = await fetch("/api/billing/custom-request", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requirements: reqRequirements, budget: reqBudget || undefined, timeframe: reqTimeframe || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setReqStatus("Submitted! We'll contact you via email.");
        setReqRequirements("");
        setReqBudget("");
        setReqTimeframe("");
      } else {
        setReqStatus(data?.error || "Submission failed");
      }
    } catch (e) {
      setReqStatus("Submission failed");
    } finally {
      setReqLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing</h1>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Your Entitlements</h2>
        {Object.keys(entitlements).length === 0 ? (
          <p>No active subscriptions.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Core Plans */}
            <div className="rounded-lg border p-3">
              <h3 className="font-semibold mb-2">Core Plans</h3>
              <ul className="pl-4 list-disc text-sm">
                {(["nano","basic","pro"] as const).filter((k) => entitlements[k]).map((k) => {
                  const t: any = entitlements[k];
                  return (
                    <li key={k}>
                      {k.charAt(0).toUpperCase() + k.slice(1)}: Standard {t.standard || 0}, Premium {t.premium || 0}
                    </li>
                  );
                })}
                {(!entitlements["nano"] && !entitlements["basic"] && !entitlements["pro"]) && (
                  <li className="list-none text-gray-500">None</li>
                )}
              </ul>
            </div>
            {/* RAM Add-ons */}
            <div className="rounded-lg border p-3">
              <h3 className="font-semibold mb-2">RAM Add-ons</h3>
              <ul className="pl-4 list-disc text-sm">
                {([
                  {k: "ram_128", label: "+128 MB"},
                  {k: "ram_256", label: "+256 MB"},
                  {k: "ram_512", label: "+512 MB"},
                  {k: "ram_1024", label: "+1 GB"},
                ] as const).filter(({k}) => entitlements[k]).map(({k, label}) => {
                  const t: any = entitlements[k];
                  return (
                    <li key={k}>
                      {label}: Standard {t.standard || 0}, Premium {t.premium || 0}
                    </li>
                  );
                })}
                {(!entitlements["ram_128"] && !entitlements["ram_256"] && !entitlements["ram_512"] && !entitlements["ram_1024"]) && (
                  <li className="list-none text-gray-500">None</li>
                )}
              </ul>
            </div>
            {/* QoL Upgrades */}
            <div className="rounded-lg border p-3">
              <h3 className="font-semibold mb-2">QoL Upgrades</h3>
              <ul className="pl-4 list-disc text-sm">
                {([
                  {k: "qol_priority_support", label: "Priority Support"},
                  {k: "qol_maintenance", label: "Bot Maintenance"},
                ] as const).filter(({k}) => entitlements[k]).map(({k, label}) => {
                  const t: any = entitlements[k];
                  return (
                    <li key={k}>
                      {label}: active {((t.standard || 0) + (t.premium || 0))}
                    </li>
                  );
                })}
                {(!entitlements["qol_priority_support"] && !entitlements["qol_maintenance"]) && (
                  <li className="list-none text-gray-500">None</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
      {/* Marketing Pricing */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Plans – marketing optimized</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">Clear benefits. Prices load dynamically from Stripe.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-neutral-700">
              <h3 className="text-xl font-semibold">Standard (Shared)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Best value • Soft limits • Shared pool</p>
              <p className="mt-3 text-2xl font-bold">from {fmt("PRICE_NANO_STANDARD", "€0.50")} / month</p>
            </div>
            <div className="p-5 space-y-2 text-sm">
              <p>• 128–512 MB RAM per plan</p>
              <p>• Ideal für kleinere und mittlere Bots</p>
              <p>• Promo‑Codes unterstützt</p>
            </div>
            <div className="p-5 pt-0">
              <button onClick={() => { setTier("standard"); setPlan("nano"); setQuantity(1); }} className="bg-blue-600 text-white px-4 py-2 rounded">Start now</button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-neutral-700">
              <h3 className="text-xl font-semibold">Premium (Guaranteed)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Guaranteed resources • No overbooking</p>
              <p className="mt-3 text-2xl font-bold">from {fmt("PRICE_NANO_PREMIUM", "€1.50")} / month</p>
            </div>
            <div className="p-5 space-y-2 text-sm">
              <p>• Für anspruchsvolle/produktive Bots</p>
              <p>• Konstante Performance ohne Spikes</p>
              <p>• Promo‑Codes unterstützt</p>
            </div>
            <div className="p-5 pt-0">
              <button onClick={() => { setTier("premium"); setPlan("nano"); setQuantity(1); }} className="bg-blue-600 text-white px-4 py-2 rounded">Start now</button>
            </div>
          </div>
        </div>
      </div>


      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Active Subscriptions</h2>
        {subscriptions.length === 0 ? (
          <p>None</p>
        ) : (
          <ul className="pl-0">
            {subscriptions.map((s) => (
              <li key={s.id} className="flex items-center justify-between border p-2 rounded mb-2">
                <span>{s.plan} × {s.quantity}</span>
                <button onClick={() => cancel(s.id)} className="bg-red-600 text-white px-3 py-1 rounded">Cancel</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <div className="relative rounded-xl border-2 border-blue-500/40 dark:border-blue-400/40 ring-2 ring-blue-500/10 dark:ring-blue-400/20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-lg overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
                  Buy & Scale
                  <span className="inline-flex items-center rounded-full bg-blue-600 text-white text-xs font-semibold px-2 py-0.5">Checkout</span>
                </h2>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Purchase your first plan/bot or scale existing capacity — the only area with direct checkout.</p>
              </div>
              <div className="hidden md:flex items-center text-sm text-blue-700 dark:text-blue-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2"><path d="M9 7V6a3 3 0 1 1 6 0v1h3a1 1 0 0 1 0 2h-.126l-1.04 10.403A3 3 0 0 1 12.847 22h-1.694a3 3 0 0 1-2.987-2.597L7.126 9H7a1 1 0 1 1 0-2h2Zm2 0h2V6a1 1 0 1 0-2 0v1Z"/></svg>
                Secure checkout
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Tier</label>
                <select value={tier} onChange={(e) => setTier(e.target.value)} className="border p-2 rounded bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100">
                  <option value="standard">Standard (shared)</option>
                  <option value="premium">Premium (guaranteed)</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Plan</label>
                <select value={plan} onChange={(e) => setPlan(e.target.value)} className="border p-2 rounded bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100">
                  <option value="nano">Nano</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Quantity</label>
                <input type="number" min={1} max={100} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value || "1", 10))} className="border p-2 rounded bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100" />
              </div>
              <div className="flex md:justify-end">
                <button onClick={subscribe} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow">
                  Go to checkout
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              {(() => {
                const priceKey = `PRICE_${plan.toUpperCase()}_${tier.toUpperCase()}`;
                return (
                  <span className="inline-flex items-center rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1">
                    Selected: {fmt(priceKey, "-")} / month × {quantity}
                  </span>
                );
              })()}
              <span className="text-gray-600 dark:text-gray-300">Subscriptions are per bot. Buy multiple to allow more bots per plan.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing table */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Pricing</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">Choose a plan and tier. Premium provides guaranteed resources; Standard uses shared resources.</p>
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
                <p className="mt-2 font-bold">{fmt("PRICE_NANO_STANDARD", "€0.50")} / month</p>
                <button onClick={() => { setTier("standard"); setPlan("nano"); setQuantity(1); }} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Choose</button>
              </div>
              <div className="border rounded p-3">
                <h4 className="font-semibold">Basic Standard</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">256 MB RAM</p>
                <p className="mt-2 font-bold">{fmt("PRICE_BASIC_STANDARD", "€1.50")} / month</p>
                <button onClick={() => { setTier("standard"); setPlan("basic"); setQuantity(1); }} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Choose</button>
              </div>
              <div className="border rounded p-3">
                <h4 className="font-semibold">Pro Standard</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">512 MB RAM</p>
                <p className="mt-2 font-bold">{fmt("PRICE_PRO_STANDARD", "€3.00")} / month</p>
                <button onClick={() => { setTier("standard"); setPlan("pro"); setQuantity(1); }} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Choose</button>
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
                <p className="mt-2 font-bold">{fmt("PRICE_NANO_PREMIUM", "€1.50")} / month</p>
                <button onClick={() => { setTier("premium"); setPlan("nano"); setQuantity(1); }} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Choose</button>
              </div>
              <div className="border rounded p-3">
                <h4 className="font-semibold">Basic Premium</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">256 MB RAM</p>
                <p className="mt-2 font-bold">{fmt("PRICE_BASIC_PREMIUM", "€3.00")} / month</p>
                <button onClick={() => { setTier("premium"); setPlan("basic"); setQuantity(1); }} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Choose</button>
              </div>
              <div className="border rounded p-3">
                <h4 className="font-semibold">Pro Premium</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">512 MB RAM</p>
                <p className="mt-2 font-bold">{fmt("PRICE_PRO_PREMIUM", "€6.00")} / month</p>
                <button onClick={() => { setTier("premium"); setPlan("pro"); setQuantity(1); }} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Choose</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrades */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Upgrades</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">Fine-grained RAM add-ons and QoL extras, monthly cancellable.</p>

        {/* RAM Upgrades */}
        <div className="rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
            <h3 className="text-xl font-semibold">RAM Upgrades</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Standard = shared • Premium = guaranteed</p>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[{sku:"128", label:"+128 MB RAM"}, {sku:"256", label:"+256 MB RAM"}, {sku:"512", label:"+512 MB RAM"}, {sku:"1024", label:"+1 GB RAM"}].map((r) => (
              <div key={r.sku} className="border rounded p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{r.label}</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded border p-2 flex flex-col">
                    <span className="text-gray-600 dark:text-gray-300">Standard</span>
                    <span className="font-semibold">{fmt(`PRICE_RAM_${r.sku}_STANDARD`, "-")} / month</span>
                    <button onClick={() => checkoutUpgrade({ kind: "ram", sku: r.sku, tier: "standard", quantity: 1 })} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Add</button>
                  </div>
                  <div className="rounded border p-2 flex flex-col">
                    <span className="text-gray-600 dark:text-gray-300">Premium</span>
                    <span className="font-semibold">{fmt(`PRICE_RAM_${r.sku}_PREMIUM`, "-")} / month</span>
                    <button onClick={() => checkoutUpgrade({ kind: "ram", sku: r.sku, tier: "premium", quantity: 1 })} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Add</button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Ideal für schnelle Skalierung ohne Planwechsel.</p>
              </div>
            ))}
          </div>
        </div>

        {/* QoL Upgrades */}
        <div className="rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
            <h3 className="text-xl font-semibold">Quality of Life (QoL)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Organisatorische Leistungen mit hohem Mehrwert.</p>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded p-3">
              <h4 className="font-semibold">Priority Support</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Bevorzugte Ticketbearbeitung</p>
              <p className="mt-2 font-bold">+€2.00 / month</p>
              <button onClick={() => checkoutUpgrade({ kind: "qol", sku: "priority_support", quantity: 1 })} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Enable</button>
            </div>
            <div className="border rounded p-3">
              <h4 className="font-semibold">Bot Maintenance</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Updates, Bugfixes, Monitoring</p>
              <p className="mt-2 font-bold">+€5.00 / month</p>
              <button onClick={() => checkoutUpgrade({ kind: "qol", sku: "maintenance", quantity: 1 })} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Enable</button>
            </div>
            <div className="border rounded p-3">
              <h4 className="font-semibold">Bot Building (Custom Dev)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Custom development</p>
              <p className="mt-2 font-bold">ab 150.00 € einmalig</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => checkoutUpgrade({ kind: "one_time", sku: "bot_building_baseline", quantity: 1 })} className="bg-blue-600 text-white px-3 py-1 rounded">Baseline zahlen</button>
                <button onClick={() => {
                  setReqRequirements("Custom Bot: gewünschte Features, APIs, Moderation, Musik, Slash Commands …");
                }} className="bg-neutral-700 text-white px-3 py-1 rounded">Request quote</button>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">Partnership promo codes: individual — contact us for community deals.</p>
          </div>
        </div>
      </div>

      {/* Custom Plan Request */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Request a Custom Plan</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">Tell us what you need (resources, language/runtime, storage, network, expected usage).</p>
        <div className="space-y-2">
          <textarea
            className="w-full border rounded p-2 min-h-[120px] bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100"
            placeholder="Describe your requirements..."
            value={reqRequirements}
            onChange={(e) => setReqRequirements(e.target.value)}
          />
          <div className="flex flex-col md:flex-row gap-3">
            <input
              className="border rounded p-2 flex-1 bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100"
              placeholder="Budget (optional)"
              value={reqBudget}
              onChange={(e) => setReqBudget(e.target.value)}
            />
            <input
              className="border rounded p-2 flex-1 bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100"
              placeholder="Timeframe (optional)"
              value={reqTimeframe}
              onChange={(e) => setReqTimeframe(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={submitCustomRequest} disabled={reqLoading || reqRequirements.trim().length < 10} className="bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded">
              {reqLoading ? "Submitting..." : "Submit Request"}
            </button>
            {reqStatus && <span className="text-sm text-gray-700 dark:text-gray-300">{reqStatus}</span>}
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Assign upgrades to bots</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Use purchased upgrades on specific bots. Set quantity 0 to unassign.</p>
          </div>
        </div>
        {availability.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">No upgrades purchased yet.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {availability.map((a) => {
              const key = `${a.kind}:${a.sku}:${a.tier || ""}`;
              const form = assignForm[key] || {};
              const assignedHere = assignments.filter((x) => x.kind === a.kind && x.sku === a.sku && (x.tier || "") === (a.tier || ""));
              return (
                <div key={key} className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{a.kind} • {a.sku}{a.tier ? ` • ${a.tier}` : ""}</p>
                      <h3 className="text-base font-semibold">Available {a.available} / {a.total}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Assigned elsewhere: {a.assigned - (assignedHere.reduce((s, x) => s + x.quantity, 0))}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {assignedHere.length > 0 ? assignedHere.map((as) => (
                      <div key={`${as.botId}-${as.sku}`} className="flex justify-between text-gray-700 dark:text-gray-200">
                        <span>Bot #{as.botId}</span>
                        <span>Qty {as.quantity}</span>
                      </div>
                    )) : <p className="text-xs text-gray-500">No assignments yet.</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                    <select
                      value={form.botId ?? ""}
                      onChange={(e) => setAssignForm((prev) => ({ ...prev, [key]: { ...prev[key], botId: Number(e.target.value) || undefined } }))}
                      className="border rounded px-2 py-1 bg-white dark:bg-neutral-900"
                    >
                      <option value="">Select bot</option>
                      {bots.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name || `Bot ${b.id}`} ({b.plan || "plan"})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      max={a.total}
                      value={form.quantity ?? 1}
                      onChange={(e) => setAssignForm((prev) => ({ ...prev, [key]: { ...prev[key], quantity: parseInt(e.target.value || "0", 10) } }))}
                      className="border rounded px-2 py-1 bg-white dark:bg-neutral-900"
                      placeholder="Qty"
                    />
                    <button
                      onClick={() => assignUpgrade(a)}
                      disabled={assignLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded"
                    >
                      {assignLoading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8 border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900">
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-neutral-800">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Ad inventory</p>
            <h2 className="text-base font-semibold">Pick a slot, size, and monthly rate</h2>
          </div>
          <a href={adMailTo} className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900/50">
            Book a slot
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 p-4">
          {adSlots.map((slot) => (
            <a
              key={slot.title}
              href={adMailTo}
              className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition hover:-translate-y-0.5 hover:shadow-lg"
              aria-label={`${slot.title} ad slot ${slot.size} for ${slot.price}`}
            >
              <div className={`h-16 bg-gradient-to-r ${slot.accent} flex items-center justify-between px-4 text-sm font-semibold text-gray-900 dark:text-gray-100`}>
                <span>This could be your ad</span>
                <span className="text-xs font-medium">{slot.size}</span>
              </div>
              <div className="px-4 py-3 space-y-1">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>{slot.title}</span>
                  <span className="text-blue-700 dark:text-blue-200">{slot.price}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug">{slot.blurb}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-200 group-hover:underline">
                  Email owner@example.com
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5H19.5V10.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5L10.5 13.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.75C5.50574 7.24426 5.23184 7.91473 5.25 8.60859C5.26816 9.30244 5.57673 9.96362 6.1 10.4L9.6 13.4C9.99005 13.725 10.4801 13.9 10.9875 13.9C11.4949 13.9 11.985 13.725 12.375 13.4L13.4 12.6" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5H4.5V13.5" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
