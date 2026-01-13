import { NextResponse } from "next/server";

const API_URL = process.env.BACKEND_URL || process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = { error: res.statusText || "Invalid response from backend" };
    }

    const response = NextResponse.json(data, { status: res.status });
    if (data?.token && res.ok) {
      const forwardedProto = request.headers.get("x-forwarded-proto");
      const secureCookie = process.env.COOKIE_SECURE === "true" || forwardedProto === "https";
      response.cookies.set("token", data.token, {
        httpOnly: true,
        secure: !!secureCookie,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    return response;
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Login failed" }, { status: 502 });
  }
}