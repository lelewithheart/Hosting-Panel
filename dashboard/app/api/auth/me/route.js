import { NextResponse } from "next/server";

const API_URL = process.env.BACKEND_URL || process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = { error: res.statusText || "Invalid response from backend" };
    }
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Auth check failed" }, { status: 502 });
  }
}