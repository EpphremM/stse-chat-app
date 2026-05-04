"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut
} from "firebase/auth";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  theme: "dark",
  toggleTheme: () => { },
  logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const raw = localStorage.getItem("chat-theme");
    return raw === "light" || raw === "dark" ? raw : "dark";
  });

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("chat-theme", newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Update user status in Firestore
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
          email: user.email,
          uid: user.uid,
          displayName: user.displayName || user.email?.split("@")[0],
          photoURL: user.photoURL || null,
          status: "online",
          lastSeen: serverTimestamp(),
        }, { merge: true });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /** Reflect real presence: Firestore stayed "online" until explicit logout. Sync with tab visibility. */
  useEffect(() => {
    if (typeof document === "undefined" || !user) return;

    const uid = user.uid;

    const setPresence = (status: "online" | "offline") => {
      void setDoc(
        doc(db, "users", uid),
        { status, lastSeen: serverTimestamp() },
        { merge: true }
      );
    };

    const syncFromVisibility = () => {
      setPresence(document.visibilityState === "visible" ? "online" : "offline");
    };

    syncFromVisibility();

    document.addEventListener("visibilitychange", syncFromVisibility);
    const onPageHide = () => setPresence("offline");
    window.addEventListener("pagehide", onPageHide);

    return () => {
      document.removeEventListener("visibilitychange", syncFromVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [user]);

  const logout = async () => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        status: "offline",
        lastSeen: serverTimestamp(),
      });
    }
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, theme, toggleTheme, logout }}>
      {loading ? (
        <div className="w-full h-svh grid place-items-center bg-background text-foreground">
          <Loader2 className="animate-spin size-8" aria-hidden />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
