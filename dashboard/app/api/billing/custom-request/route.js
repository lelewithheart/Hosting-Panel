import { NextResponse } from "next/server";

const API_URL = process.env.BACKEND_URL || process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  let body = {};
  try { body = await request.json(); } catch {}

  const res = await fetch(`${API_URL}/billing/custom-request`, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data;
  try { data = await res.json(); } catch { data = { error: res.statusText || "Invalid response" }; }
  return NextResponse.json(data, { status: res.status });
}
