"use client";

import { useState, useRef } from "react";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinaryClient";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Camera, User, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user, theme, toggleTheme } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, "users", user.uid), { displayName });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setLoading(true);
    try {
      const photoURL = await uploadToCloudinary(file, {
        purpose: "avatar",
        userId: user.uid,
      });
      await updateProfile(user, { photoURL });
      await updateDoc(doc(db, "users", user.uid), { photoURL });
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 animate-fade-in">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted hover:text-identity mb-8 font-bold uppercase text-xs tracking-widest transition-colors underline-offset-4 hover:underline"
        >
          <ArrowLeft size={18} strokeWidth={2.5} /> Back
        </Link>

        <h1 className="text-3xl font-black uppercase tracking-tight mb-10 text-foreground">
          Account
        </h1>

        <div className="space-y-8">
          <section className="bg-surface p-6 border border-border">
            <h2 className="text-lg font-black uppercase tracking-wide mb-6 flex items-center gap-2 text-foreground">
              <Camera className="shrink-0" size={22} strokeWidth={2.5} /> Photo
            </h2>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="relative group">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    className="w-24 h-24 object-cover border border-border"
                  />
                ) : (
                  <div className="w-24 h-24 bg-secondary/30 border border-border flex items-center justify-center text-3xl font-black text-secondary-fg">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-foreground/80 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-bold uppercase text-xs"
                >
                  <Camera size={24} strokeWidth={2.5} />
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-identity text-identity-fg px-4 py-2 border border-border font-bold uppercase text-xs tracking-widest hover:opacity-90 transition-opacity"
                >
                  Upload
                </button>
                <p className="text-xs text-muted mt-3 font-medium">JPG, PNG or GIF. Max ~2MB recommended.</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                className="hidden"
                accept="image/*"
              />
            </div>
          </section>

          <section className="bg-surface p-6 border border-border">
            <h2 className="text-lg font-black uppercase tracking-wide mb-6 flex items-center gap-2 text-foreground">
              <User className="shrink-0" size={22} strokeWidth={2.5} /> Profile
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">
                  Display name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-input border border-border px-4 py-3 text-foreground focus:outline-none focus:border-identity"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">
                  Email (read-only)
                </label>
                <input
                  type="text"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-surface-2 border border-border px-4 py-3 text-muted cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-identity text-identity-fg px-6 py-3 border border-border font-bold uppercase text-xs tracking-widest hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {success ? (
                  <>
                    <Check size={20} strokeWidth={2.5} /> Saved
                  </>
                ) : loading ? (
                  "Saving…"
                ) : (
                  "Save"
                )}
              </button>
            </form>
          </section>

          <section className="bg-surface p-6 border border-border bg-secondary/5">
            <h2 className="text-lg font-black uppercase tracking-wide mb-6 text-foreground">
              Appearance
            </h2>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-bold text-foreground">Theme</p>
                <p className="text-sm text-muted font-medium mt-1 uppercase">
                  Current theme: {theme}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={`relative w-16 h-9 border border-border transition-colors ${
                  theme === "dark" ? "bg-identity/20" : "bg-secondary/40"
                }`}
                aria-pressed={theme === "dark"}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-7 h-7 border border-border transition-transform flex items-center justify-center text-xs font-black ${
                    theme === "dark"
                      ? "translate-x-7 bg-identity text-identity-fg"
                      : "translate-x-0 bg-secondary text-secondary-fg"
                  }`}
                >
                  {theme === "dark" ? "D" : "L"}
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
