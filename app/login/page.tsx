"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="w-full max-w-md mx-auto h-1 bg-identity mb-6 shrink-0" aria-hidden />
      <div className="w-full max-w-md p-8 bg-surface border border-border">
        <h1 className="text-3xl font-black mb-2 text-center uppercase tracking-tight text-foreground">Welcome back</h1>
        <p className="text-muted text-center mb-10 text-sm font-medium">Sign in to continue</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-0 focus:border-identity transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-0 focus:border-identity transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-[var(--danger-muted)] border border-danger text-danger text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-identity text-identity-fg font-bold uppercase tracking-wide border border-border hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-10 text-center text-muted text-sm font-medium">
          No account?{" "}
          <Link href="/register" className="text-identity font-bold underline underline-offset-4 hover:text-secondary">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
