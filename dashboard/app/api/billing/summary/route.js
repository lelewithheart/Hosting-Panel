import { NextResponse } from "next/server";

const API_URL = process.env.BACKEND_URL || process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const res = await fetch(`${API_URL}/billing/summary`, {
    headers: { Authorization: authHeader },
  });
  let data;
  try { data = await res.json(); } catch { data = { error: res.statusText || "Invalid response" }; }
  return NextResponse.json(data, { status: res.status });
}
