"use client";

import { useState } from "react";
import { useAuth } from "../auth/context";
import { useRouter } from "next/navigation";
import { BRAND_NAME } from "../branding";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await register(email, password);
    if (res.error) {
      setError(res.error);
      setSubmitting(false);
    } else {
      router.push("/bots");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-neutral-700 w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">{BRAND_NAME}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Create your account to manage bots</p>
        </div>
        <h2 className="text-xl mb-4">Register</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full p-2 mb-2 border rounded bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full p-2 mb-2 border rounded bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700"
          required
        />
        <button type="submit" disabled={submitting} className={`bg-blue-600 hover:bg-blue-700 text-white p-2 w-full rounded ${submitting ? "opacity-60 cursor-not-allowed" : ""}`}>{submitting ? "Registering…" : "Register"}</button>
        <p className="mt-2">
          Have account? <a href="/login" className="text-blue-500">Login</a>
        </p>
      </form>
    </div>
  );
}