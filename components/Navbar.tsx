"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, User } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">C</span>
        </div>
        <h1 className="text-xl font-bold text-white hidden sm:block">SkyChat</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-slate-900/50 py-1.5 px-3 rounded-full border border-slate-700">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-slate-300">
            <User size={18} />
          </div>
          <span className="text-sm text-slate-300 hidden md:inline">{user?.email}</span>
        </div>
        
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700"
          title="Logout"
        >
          <LogOut size={20} />
          <span className="hidden sm:inline text-sm font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
