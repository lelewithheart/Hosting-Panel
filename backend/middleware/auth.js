import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const requireSubscription = (req, res, next) => {
  (async () => {
    try {
      // Admins can bypass subscription checks
      if (req.user?.isAdmin) return next();
      const count = await prisma.subscription.count({ where: { userId: req.user.id, active: true } });
      if (count === 0) return res.status(403).json({ error: "Subscription required" });
      next();
    } catch (e) {
      res.status(500).json({ error: "Subscription check failed" });
    }
  })();
};