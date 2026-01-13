import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import Stripe from "stripe";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "./utils/prisma.js";

import authRoutes from "./routes/auth.js";
import botRoutes from "./routes/bots.js";
import billingRoutes from "./routes/billing.js";
import { authenticate, requireSubscription } from "./middleware/auth.js";

const app = express();
app.set("trust proxy", 1);
// Disable ETag to prevent 304 caching on API responses
app.set("etag", false);
// Stripe webhook must use raw body, register route before json middleware
const stripeSecret = process.env.STRIPE_SECRET || process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (stripeSecret && stripeWebhookSecret) {
  const stripe = new Stripe(stripeSecret);
  app.post("/billing/webhook", express.raw({ type: "application/json" }), (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { userId, plan, tier, quantity, upgrade_kind, upgrade_sku } = session.metadata || {};
      const stripeCustomerId = session.customer;
      const stripeCheckoutId = session.id;
      const stripeSubscriptionId = session.subscription;
      const qty = Number(quantity || 1);
      (async () => {
        try {
          // Avoid duplicates on retries
          const existing = await prisma.subscription.findFirst({ where: { stripeCheckoutId } });
          if (!existing) {
            // Only persist subscriptions for recurring sessions
            if (session.mode === 'subscription' && stripeSubscriptionId) {
              let resolvedPlan = plan || "basic";
              let resolvedTier = tier === "premium" ? "premium" : "standard";
              if (upgrade_kind && upgrade_sku) {
                if (upgrade_kind === 'ram') {
                  resolvedPlan = `ram_${String(upgrade_sku)}`;
                  resolvedTier = tier === "premium" ? "premium" : "standard";
                } else if (upgrade_kind === 'qol') {
                  resolvedPlan = `qol_${String(upgrade_sku)}`;
                  resolvedTier = "standard";
                }
              }
              await prisma.subscription.create({
                data: {
                  userId: Number(userId),
                  plan: resolvedPlan,
                  quantity: Number.isInteger(qty) && qty > 0 ? qty : 1,
                  tier: resolvedTier,
                  active: true,
                  stripeCustomerId: typeof stripeCustomerId === 'string' ? stripeCustomerId : String(stripeCustomerId || ''),
                  stripeCheckoutId,
                  stripeSubscriptionId: typeof stripeSubscriptionId === 'string' ? stripeSubscriptionId : String(stripeSubscriptionId || '')
                }
              });
            }
          }
        } catch (e) {
          console.error("Failed to persist subscription from webhook", e);
        }
      })();
    }

    // You can handle other event types as needed
    res.json({ received: true });
  });
}

app.use(express.json({ limit: process.env.JSON_LIMIT || "1mb" }));
app.use(helmet());
app.use(morgan(process.env.LOG_FORMAT || "dev"));

// Enforce no-cache on all API responses
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// Support multiple CORS origins via CORS_ORIGINS (comma-separated) or single CORS_ORIGIN
const rawOrigins = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "*";
const originList = rawOrigins.split(",").map((s) => s.trim()).filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // non-browser or same-origin
    if (originList.includes("*")) return callback(null, true);
    if (originList.includes(origin)) return callback(null, true);
    // Also allow when origin matches without protocol or trailing slash
    try {
      const o = new URL(origin);
      for (const allowed of originList) {
        try {
          const a = new URL(allowed);
          if (a.hostname === o.hostname && a.port === o.port) {
            return callback(null, true);
          }
        } catch {}
      }
    } catch {}
    callback(new Error("Not allowed by CORS"));
  },
  credentials: !originList.includes("*"),
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type", "Accept"],
};
app.use(cors(corsOptions));
// Respond to preflight requests without using '*' path which breaks path-to-regexp
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Optional HTTP → HTTPS redirect (place before routes)
const SSL_ENABLED = String(process.env.SSL_ENABLED || "false").toLowerCase() === "true";
const SSL_PORT = Number(process.env.SSL_PORT || 443);
if (SSL_ENABLED) {
  app.use((req, res, next) => {
    const xfProto = req.headers["x-forwarded-proto"];
    const isSecure = req.secure || xfProto === "https" || req.socket.encrypted;
    if (!isSecure) {
      const host = req.headers.host || `localhost:${SSL_PORT}`;
      return res.redirect(301, `https://${host}${req.url}`);
    }
    next();
  });
}

// Routes
app.use("/auth", authRoutes);
app.use("/bots", authenticate, requireSubscription, botRoutes);
app.use("/billing", authenticate, billingRoutes);

// Health & root
app.get("/", (req, res) => {
  res.send("Backend is running");
});
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? "Internal Server Error" : err.message });
});

// Start HTTP and optional HTTPS
const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || "0.0.0.0";

let server = app.listen(PORT, HOST, () => {
  console.log(`Backend HTTP running on ${HOST}:${PORT}`);
});

if (SSL_ENABLED) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, "certs", "server.fullchain.pem");
  const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, "certs", "server.privkey.pem");
  try {
    const options = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
    const httpsServer = https.createServer(options, app);
    httpsServer.listen(SSL_PORT, HOST, () => {
      console.log(`Backend HTTPS running on ${HOST}:${SSL_PORT}`);
    });
    // Redirect HTTP → HTTPS
    app.use((req, res, next) => {
      const xfProto = req.headers["x-forwarded-proto"];
      const isSecure = req.secure || xfProto === "https";
      if (!isSecure) {
        const host = req.headers.host || `localhost:${SSL_PORT}`;
        return res.redirect(301, `https://${host}${req.url}`);
      }
      next();
    });
  } catch (e) {
    console.error("Failed to start HTTPS server:", e?.message || e);
  }
}

// Diagnostics: capture exits and errors to understand restarts
process.on("exit", (code) => {
  try { console.log(`[backend] process exit code=${code}`); } catch {}
});
process.on("SIGTERM", () => {
  try { console.log("[backend] received SIGTERM"); } catch {}
});
process.on("SIGINT", () => {
  try { console.log("[backend] received SIGINT"); } catch {}
});
process.on("uncaughtException", (err) => {
  try { console.error("[backend] uncaughtException", err); } catch {}
});
process.on("unhandledRejection", (reason) => {
  try { console.error("[backend] unhandledRejection", reason); } catch {}
});
server.on("close", () => {
  try { console.log("[backend] http server closed"); } catch {}
});
