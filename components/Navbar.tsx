"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Settings, Sun, Moon } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useAuth();

  return (
    <nav className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0 z-20">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-identity text-identity-fg border border-border flex items-center justify-center font-black text-lg leading-none">
            C
          </div>
          <h1 className="text-lg font-black tracking-tight text-foreground hidden sm:block uppercase">
            SkyChat
          </h1>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-muted hover:text-identity hover:bg-secondary/15 transition-colors"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
        </button>

        <Link
          href="/settings"
          className="p-2 text-muted hover:text-identity hover:bg-secondary/15 transition-colors"
          title="Settings"
        >
          <Settings size={20} strokeWidth={2.5} />
        </Link>

        <div className="flex items-center gap-3 bg-surface-2 py-1.5 px-3 border border-border ml-2">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-8 h-8 object-cover border border-border" />
          ) : (
            <div className="w-8 h-8 bg-input border border-border flex items-center justify-center text-muted">
              <User size={18} strokeWidth={2.5} />
            </div>
          )}
          <span className="text-sm font-medium text-foreground hidden md:inline max-w-[120px] truncate">
            {user?.displayName || user?.email}
          </span>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="flex items-center gap-2 text-muted hover:text-identity hover:bg-secondary/15 transition-colors p-2 ml-1"
          title="Logout"
        >
          <LogOut size={20} strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
}
