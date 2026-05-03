"use client";

import { useState, useRef } from "react";
import { updateProfile } from "firebase/auth";
<<<<<<< HEAD
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinaryClient";
import { useAuth } from "@/context/AuthContext";
=======
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
import Navbar from "@/components/Navbar";
import { Camera, User, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user, theme, toggleTheme } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
<<<<<<< HEAD
=======
  const router = useRouter();

>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
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
<<<<<<< HEAD
      const photoURL = await uploadToCloudinary(file, {
        purpose: "avatar",
        userId: user.uid,
      });
      await updateProfile(user, { photoURL });
      await updateDoc(doc(db, "users", user.uid), { photoURL });
      window.location.reload();
=======
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL });
      await updateDoc(doc(db, "users", user.uid), { photoURL });
      window.location.reload(); // Refresh to update all instances
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 animate-fade-in">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Chat
        </Link>

        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        <div className="space-y-8">
          {/* Avatar Section */}
          <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Camera className="text-blue-500" /> Profile Picture
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative group">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-slate-700" />
                ) : (
                  <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center text-3xl font-bold text-slate-300">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                )}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera size={24} />
                </button>
              </div>
              <div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Change Avatar
                </button>
                <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
            </div>
          </section>

          {/* Profile Details */}
          <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User className="text-blue-500" /> Profile Details
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Display Name</label>
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
<<<<<<< HEAD
                  className="w-full bg-input border border-border px-4 py-3 text-foreground focus:outline-none focus:border-identity"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted mb-2">
                  Email (read-only)
                </label>
=======
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email (Read-only)</label>
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
                <input
                  type="text"
                  value={user?.email || ""}
                  disabled
<<<<<<< HEAD
                  className="w-full bg-surface-2 border border-border px-4 py-3 text-muted cursor-not-allowed"
=======
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
                />
              </div>
              <button
                type="submit"
                disabled={loading}
<<<<<<< HEAD
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
=======
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {success ? <><Check size={20} /> Changes Saved</> : loading ? "Updating..." : "Save Changes"}
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
              </button>
            </form>
          </section>

<<<<<<< HEAD
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
=======
          {/* Appearance */}
          <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h2 className="text-xl font-semibold mb-6">Appearance</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme Preference</p>
                <p className="text-sm text-slate-500">Switch between light and dark mode</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-14 h-8 rounded-full transition-colors ${theme === "dark" ? "bg-blue-600" : "bg-slate-700"}`}
              >
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${theme === "dark" ? "translate-x-6" : ""}`} />
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
