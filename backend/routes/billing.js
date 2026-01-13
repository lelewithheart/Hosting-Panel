import express from "express";
import Stripe from "stripe";
import { prisma } from "../utils/prisma.js";
import fs from "fs";
import { sendMail } from "../utils/mail.js";

const router = express.Router();

// Deprecated: direct subscribe without payment is disabled
router.post("/subscribe", async (_req, res) => {
  return res.status(403).json({ error: "Subscription requires payment. Use /billing/checkout." });
});

// Start Stripe Checkout
router.post("/checkout", async (req, res) => {
  const userId = req.user.id;
  const userEmail = req.user.email;
  const { plan = "basic", quantity = 1, tier = "standard" } = req.body || {};
  try {
    if (!["nano", "basic", "pro"].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan" });
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
      return res.status(400).json({ error: "Invalid quantity" });
    }
    if (!["standard","premium"].includes(tier)) {
      return res.status(400).json({ error: "Invalid tier" });
    }

    const stripeSecret = process.env.STRIPE_SECRET || process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return res.status(500).json({ error: "Stripe not configured" });
    }
    const stripe = new Stripe(stripeSecret);

    const priceKey = `PRICE_${plan.toUpperCase()}_${tier.toUpperCase()}`;
    let priceId = process.env[priceKey];
    if (!priceId) {
      return res.status(500).json({ error: `Missing Stripe price ID for ${plan} ${tier}` });
    }

    const successUrl = process.env.CHECKOUT_SUCCESS_URL || "https://www.example.com/billing/success";
    const cancelUrl = process.env.CHECKOUT_CANCEL_URL || "https://www.example.com/billing/cancel";

    // Allow env set to product ID; resolve to its default price
    if (priceId.startsWith("prod_")) {
      try {
        const product = await stripe.products.retrieve(priceId);
        const defaultPrice = typeof product.default_price === 'string' ? product.default_price : product.default_price?.id;
        if (defaultPrice) {
          priceId = defaultPrice;
        } else {
          // Fallback: find first recurring active price for this product
          const prices = await stripe.prices.list({ product: product.id, active: true, limit: 1 });
          if (prices.data[0]?.id) priceId = prices.data[0].id;
        }
      } catch (e) {
        console.warn("Failed to resolve product to price", e?.message || e);
      }
    }

    if (!priceId.startsWith("price_")) {
      return res.status(500).json({ error: `Configured ID is not a Stripe price. Please set a price_... ID for ${plan} ${tier}.` });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price: priceId, quantity: qty }
      ],
      success_url: successUrl + "?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: cancelUrl,
      customer_email: userEmail,
      allow_promotion_codes: true,
      metadata: {
        userId: String(userId),
        plan,
        tier,
        quantity: String(qty)
      }
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error("Checkout error", e);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// Checkout for add-on upgrades (RAM and QoL)
router.post("/checkout-upgrade", async (req, res) => {
  const userId = req.user.id;
  const userEmail = req.user.email;
  const { kind, sku, tier = "standard", quantity = 1 } = req.body || {};
  try {
    const stripeSecret = process.env.STRIPE_SECRET || process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return res.status(500).json({ error: "Stripe not configured" });
    }
    const stripe = new Stripe(stripeSecret);

    const qty = Number(quantity) || 1;
    if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    let priceKey;
    let mode = "subscription"; // default monthly recurring

    if (kind === "ram") {
      if (!["standard", "premium"].includes(tier)) {
        return res.status(400).json({ error: "Invalid tier" });
      }
      // sku values: 128, 256, 512, 1024
      const valid = ["128", "256", "512", "1024"];
      if (!valid.includes(String(sku))) {
        return res.status(400).json({ error: "Invalid RAM sku" });
      }
      priceKey = `PRICE_RAM_${String(sku)}_${tier.toUpperCase()}`;
    } else if (kind === "qol") {
      // sku: priority_support, maintenance
      const map = {
        priority_support: "PRICE_QOL_PRIORITY_SUPPORT",
        maintenance: "PRICE_QOL_MAINTENANCE",
      };
      if (!map[sku]) {
        return res.status(400).json({ error: "Invalid QoL sku" });
      }
      priceKey = map[sku];
    } else if (kind === "one_time" && sku === "bot_building_baseline") {
      // Optional: allow one-time baseline for custom dev
      priceKey = "PRICE_QOL_BOT_BUILDING_BASELINE";
      mode = "payment";
    } else {
      return res.status(400).json({ error: "Invalid upgrade kind/sku" });
    }

    let priceId = process.env[priceKey];
    if (!priceId) {
      return res.status(500).json({ error: `Missing Stripe price ID for ${priceKey}` });
    }

    const successUrl = process.env.CHECKOUT_SUCCESS_URL || "https://www.example.com/billing/success";
    const cancelUrl = process.env.CHECKOUT_CANCEL_URL || "https://www.example.com/billing/cancel";

    // Allow env set to product ID; resolve to its default price
    if (priceId.startsWith("prod_")) {
      try {
        const product = await stripe.products.retrieve(priceId);
        const defaultPrice = typeof product.default_price === 'string' ? product.default_price : product.default_price?.id;
        if (defaultPrice) {
          priceId = defaultPrice;
        } else {
          const prices = await stripe.prices.list({ product: product.id, active: true, limit: 1 });
          if (prices.data[0]?.id) priceId = prices.data[0].id;
        }
      } catch (e) {
        console.warn("Failed to resolve product to price", e?.message || e);
      }
    }

    if (!priceId.startsWith("price_")) {
      return res.status(500).json({ error: `Configured ID is not a Stripe price. Please set a price_... ID for ${priceKey}.` });
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [ { price: priceId, quantity: qty } ],
      success_url: successUrl + "?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: cancelUrl,
      customer_email: userEmail,
      allow_promotion_codes: true,
      metadata: {
        userId: String(userId),
        upgrade_kind: kind,
        upgrade_sku: String(sku),
        tier: String(tier || ""),
        quantity: String(qty),
      }
    });

    // Optimistically record the purchase so entitlements exist immediately.
    await prisma.upgradePurchase.create({
      data: {
        userId,
        kind,
        sku: String(sku),
        tier: tier ? String(tier) : null,
        quantity: qty,
        status: "active",
        stripeSessionId: session.id,
      }
    });

    if (kind === "qol") {
      const summary = `User ${userEmail} purchased QoL upgrade ${sku} x${qty}. Tier: ${tier || "n/a"}. Session: ${session.id}`;
      sendMail({ to: process.env.ADMIN_NOTIFY_EMAIL || "owner@example.com", subject: "QoL upgrade purchased", text: summary }).catch((e) => console.warn("Mail send failed", e?.message || e));
    }

    res.json({ url: session.url });
  } catch (e) {
    console.error("Checkout-upgrade error", e);
    res.status(500).json({ error: "Checkout failed" });
  }
});

router.get("/summary", async (req, res) => {
  const userId = req.user.id;
  try {
    const subs = await prisma.subscription.findMany({ where: { userId, active: true } });
    const entitlements = subs.reduce((acc, s) => {
      acc[s.plan] = acc[s.plan] || { standard: 0, premium: 0 };
      const tier = (s.tier === 'premium') ? 'premium' : 'standard';
      acc[s.plan][tier] += (s.quantity || 1);
      return acc;
    }, {});

    const upgrades = await prisma.upgradePurchase.findMany({ where: { userId, status: "active" } });
    const assignments = await prisma.botUpgradeAssignment.findMany({ where: { userId, active: true } });

    const aggregate = (rows) => rows.reduce((map, r) => {
      const key = `${r.kind}:${r.sku}:${r.tier || ""}`;
      map[key] = (map[key] || 0) + (r.quantity || 1);
      return map;
    }, {});

    const purchasedMap = aggregate(upgrades);
    const assignedMap = aggregate(assignments);
    const availability = Object.entries(purchasedMap).map(([key, total]) => {
      const [kind, sku, tier] = key.split(":");
      const assigned = assignedMap[key] || 0;
      return { kind, sku, tier: tier || null, total, assigned, available: Math.max(total - assigned, 0) };
    });

    res.json({ entitlements, subscriptions: subs, upgrades, assignments, availability });
  } catch (e) {
    res.status(500).json({ error: "Summary failed" });
  }
});

// Assign purchased upgrades to a specific bot
router.post("/assign-upgrade", async (req, res) => {
  const userId = req.user.id;
  const { botId, kind, sku, tier = "standard", quantity = 1 } = req.body || {};
  try {
    const botIdNum = Number(botId);
    const qty = Number(quantity);
    if (!Number.isInteger(botIdNum) || botIdNum <= 0) return res.status(400).json({ error: "Invalid botId" });
    if (!kind || !sku) return res.status(400).json({ error: "kind and sku required" });
    if (!Number.isInteger(qty) || qty < 0 || qty > 100) return res.status(400).json({ error: "Invalid quantity" });

    // Ensure the bot folder exists (basic ownership check)
    const botFolder = `/srv/panel/bots/${userId}/${botIdNum}`;
    if (!fs.existsSync(botFolder)) {
      return res.status(404).json({ error: "Bot not found" });
    }

    const purchases = await prisma.upgradePurchase.findMany({ where: { userId, status: "active", kind, sku: String(sku), tier: tier ? String(tier) : null } });
    const totalPurchased = purchases.reduce((sum, p) => sum + (p.quantity || 1), 0);

    const otherAssignments = await prisma.botUpgradeAssignment.findMany({
      where: { userId, kind, sku: String(sku), tier: tier ? String(tier) : null, active: true }
    });
    const current = otherAssignments.find((a) => a.botId === botIdNum);
    const assignedElsewhere = otherAssignments
      .filter((a) => a.botId !== botIdNum)
      .reduce((sum, a) => sum + (a.quantity || 1), 0);

    const available = totalPurchased - assignedElsewhere;
    if (qty > available) {
      return res.status(400).json({ error: `Not enough available upgrades. Available: ${available}` });
    }

    if (qty === 0) {
      if (current) {
        await prisma.botUpgradeAssignment.delete({ where: { id: current.id } });
      }
      return res.json({ success: true, assignment: null });
    }

    const upserted = await prisma.botUpgradeAssignment.upsert({
      where: { userId_botId_kind_sku_tier: { userId, botId: botIdNum, kind, sku: String(sku), tier: tier ? String(tier) : null } },
      update: { quantity: qty, active: true },
      create: { userId, botId: botIdNum, kind, sku: String(sku), tier: tier ? String(tier) : null, quantity: qty, active: true },
    });

    res.json({ success: true, assignment: upserted });
  } catch (e) {
    console.error("Assign-upgrade failed", e);
    res.status(500).json({ error: "Assign failed" });
  }
});

// Public pricing info derived from configured Stripe Price IDs
router.get("/prices", async (req, res) => {
  try {
    const stripeSecret = process.env.STRIPE_SECRET || process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return res.status(500).json({ error: "Stripe not configured" });
    }
    const stripe = new Stripe(stripeSecret);

    const keys = [];
    const push = (k) => { if (process.env[k]) keys.push(k); };

    // Core plans
    ["NANO","BASIC","PRO"].forEach((p) => {
      ["STANDARD","PREMIUM"].forEach((t) => push(`PRICE_${p}_${t}`));
    });
    // RAM upgrades
    ["128","256","512","1024"].forEach((mb) => {
      ["STANDARD","PREMIUM"].forEach((t) => push(`PRICE_RAM_${mb}_${t}`));
    });
    // QoL
    ["PRICE_QOL_PRIORITY_SUPPORT","PRICE_QOL_MAINTENANCE","PRICE_QOL_BOT_BUILDING_BASELINE"].forEach(push);

    const result = {};
    for (const key of keys) {
      try {
        let priceId = process.env[key];
        if (priceId.startsWith("prod_")) {
          const product = await stripe.products.retrieve(priceId);
          const defaultPrice = typeof product.default_price === 'string' ? product.default_price : product.default_price?.id;
          if (defaultPrice) priceId = defaultPrice;
        }
        const price = await stripe.prices.retrieve(priceId);
        result[key] = {
          id: price.id,
          currency: price.currency,
          unit_amount: price.unit_amount,
          livemode: !!price.livemode,
          recurring: price.recurring ? { interval: price.recurring.interval, interval_count: price.recurring.interval_count } : null,
          product: typeof price.product === 'string' ? price.product : price.product?.id,
        };
      } catch (e) {
        result[key] = { error: e?.message || String(e) };
      }
    }
    const keyPrefix = (process.env.STRIPE_SECRET || process.env.STRIPE_SECRET_KEY || "").startsWith("sk_live_") ? "live" : ((process.env.STRIPE_SECRET || process.env.STRIPE_SECRET_KEY || "").startsWith("sk_test_") ? "test" : "unknown");
    res.json({ prices: result, stripe_key_mode: keyPrefix });
  } catch (e) {
    res.status(500).json({ error: "Failed to load prices" });
  }
});

// Create a custom plan request
router.post("/custom-request", async (req, res) => {
  try {
    const userId = req.user.id;
    const { requirements, budget, timeframe } = req.body || {};
    const text = String(requirements || "").trim();
    if (!text || text.length < 10) {
      return res.status(400).json({ error: "Please describe your requirements (min 10 chars)." });
    }
    if (text.length > 5000) {
      return res.status(400).json({ error: "Requirements too long (max 5000 chars)." });
    }
    const rec = await prisma.customPlanRequest.create({
      data: {
        userId,
        requirements: text,
        budget: budget ? String(budget).slice(0, 200) : null,
        timeframe: timeframe ? String(timeframe).slice(0, 200) : null,
        status: "new",
      },
    });
    const lines = [
      `User ID: ${userId}`,
      `Budget: ${budget || "n/a"}`,
      `Timeframe: ${timeframe || "n/a"}`,
      "Requirements:",
      text,
    ].join("\n");
    sendMail({ to: process.env.ADMIN_NOTIFY_EMAIL || "owner@example.com", subject: "Custom plan request", text: lines }).catch((e) => console.warn("Mail send failed", e?.message || e));
    res.json({ success: true, request: { id: rec.id, status: rec.status } });
  } catch (e) {
    console.error("Custom request failed", e);
    res.status(500).json({ error: "Request failed" });
  }
});

// Admin-only: grant subscription entitlements without Stripe
router.post("/grant", async (req, res) => {
  try {
    if (!req.user?.isAdmin) return res.status(403).json({ error: "Admin required" });
    const { userId, plan = "basic", quantity = 1, tier = "standard" } = req.body || {};
    const targetUserId = Number(userId);
    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({ error: "Invalid userId" });
    }
    if (!["nano","basic","pro"].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan" });
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
      return res.status(400).json({ error: "Invalid quantity" });
    }
    if (!["standard","premium"].includes(tier)) {
      return res.status(400).json({ error: "Invalid tier" });
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) return res.status(404).json({ error: "Target user not found" });

    const sub = await prisma.subscription.create({
      data: {
        userId: targetUserId,
        plan,
        quantity: qty,
        tier,
        active: true,
        // No Stripe IDs for grants
      }
    });
    res.json({ success: true, subscription: sub });
  } catch (e) {
    console.error("Grant failed", e);
    res.status(500).json({ error: "Grant failed" });
  }
});

router.post("/cancel", async (req, res) => {
  const userId = req.user.id;
  const { subscriptionId } = req.body || {};
  try {
    const id = Number(subscriptionId);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid subscriptionId" });
    }
    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub || sub.userId !== userId || !sub.active) {
      return res.status(404).json({ error: "Subscription not found" });
    }
    // If linked to Stripe, cancel there as well
    try {
      const stripeSecret = process.env.STRIPE_SECRET || process.env.STRIPE_SECRET_KEY;
      if (stripeSecret && sub.stripeSubscriptionId) {
        const stripe = new Stripe(stripeSecret);
        await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
      }
    } catch (se) {
      console.warn("Stripe cancel warning:", se?.message || se);
      // proceed to mark canceled locally regardless
    }
    await prisma.subscription.update({ where: { id }, data: { active: false, canceledAt: new Date() } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Cancel failed" });
  }
});

router.get("/", (req, res) => {
  res.json({ message: "Billing route working" });
});

export default router;
