"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Settings, Sun, Moon } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useAuth();

  return (
    <nav className="h-16 bg-slate-800 dark:bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 shrink-0 z-20">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <h1 className="text-xl font-bold text-white hidden sm:block">SkyChat</h1>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <Link
          href="/settings"
          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
          title="Settings"
        >
          <Settings size={20} />
        </Link>

        <div className="flex items-center gap-3 bg-slate-900/50 py-1.5 px-3 rounded-full border border-slate-700 ml-2">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-slate-300">
              <User size={18} />
            </div>
          )}
          <span className="text-sm text-slate-300 hidden md:inline max-w-[120px] truncate">
            {user?.displayName || user?.email}
          </span>
        </div>
        
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700 ml-1"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}
