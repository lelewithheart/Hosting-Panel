import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

// Register
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
  const user = await prisma.user.create({ data: { email, passwordHash, isAdmin } });

  const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, isAdmin: user.isAdmin } });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  // Auto-tag admin if email is in ADMIN_EMAILS
  const shouldBeAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
  if (shouldBeAdmin && !user.isAdmin) {
    await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
  }
  const token = jwt.sign({ id: user.id, email: user.email, isAdmin: shouldBeAdmin || user.isAdmin }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, isAdmin: shouldBeAdmin || user.isAdmin } });
});

// Get user
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const subs = await prisma.subscription.findMany({ where: { userId: user.id, active: true } });
    const entitlements = subs.reduce((acc, s) => { acc[s.plan] = (acc[s.plan] || 0) + (s.quantity || 1); return acc; }, {});
    res.json({ user: { id: user.id, email: user.email, isAdmin: user.isAdmin, subscription: Object.keys(entitlements).length ? entitlements : null } });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
