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
<<<<<<< HEAD
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
=======
    } catch (err: any) {
      setError(err.message);
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-2xl shadow-xl border border-slate-700">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-slate-400 text-center mb-8">Login to start chatting</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
<<<<<<< HEAD
              className="w-full px-4 py-3 bg-input border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-0 focus:border-identity transition-colors"
=======
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
<<<<<<< HEAD
            <label className="block text-xs font-bold uppercase tracking-widest text-foreground mb-2">
              Password
            </label>
=======
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
<<<<<<< HEAD
              className="w-full px-4 py-3 bg-input border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-0 focus:border-identity transition-colors"
=======
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
              placeholder="••••••••"
              required
            />
          </div>
<<<<<<< HEAD

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
=======
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        
        <p className="mt-8 text-center text-slate-400 text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:underline">
            Register now
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
          </Link>
        </p>
      </div>
    </div>
  );
}
