"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        uid: user.uid,
        status: "online",
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="w-full max-w-md mx-auto h-1 bg-secondary mb-6 shrink-0" aria-hidden />
      <div className="w-full max-w-md p-8 bg-surface border border-border">
        <h1 className="text-3xl font-black mb-2 text-center uppercase tracking-tight text-foreground">Create account</h1>
        <p className="text-muted text-center mb-10 text-sm font-medium">Join the chat</p>

        <form onSubmit={handleRegister} className="space-y-5">
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
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-foreground mb-2">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            className="w-full py-3 px-4 bg-identity text-identity-fg font-bold uppercase tracking-wide border border-border hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className="mt-10 text-center text-muted text-sm font-medium">
          Already registered?{" "}
          <Link href="/login" className="text-identity font-bold underline underline-offset-4 hover:text-secondary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
