import nodemailer from "nodemailer";

let cachedTransport;

function getTransport() {
  if (cachedTransport) return cachedTransport;
  const url = process.env.SMTP_URL || process.env.SMTP_CONNECTION;
  if (!url) return null;
  cachedTransport = nodemailer.createTransport(url);
  return cachedTransport;
}

export async function sendMail({ to, subject, text }) {
  const transport = getTransport();
  if (!transport) {
    console.warn("SMTP not configured; skipping email", { to, subject });
    return { skipped: true };
  }
  const from = process.env.MAIL_FROM || "noreply@example.com";
  await transport.sendMail({ from, to, subject, text });
  return { sent: true };
}
