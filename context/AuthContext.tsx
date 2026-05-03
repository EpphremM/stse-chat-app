"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
<<<<<<< HEAD
import {
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut
} from "firebase/auth";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
=======
import { 
  onAuthStateChanged, 
  User, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5

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
<<<<<<< HEAD
  toggleTheme: () => { },
  logout: async () => { },
=======
  toggleTheme: () => {},
  logout: async () => {},
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const raw = localStorage.getItem("chat-theme");
    return raw === "light" || raw === "dark" ? raw : "dark";
  });
=======
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("chat-theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("light", savedTheme === "light");
    }
  }, []);
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5

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
<<<<<<< HEAD
      {loading ? (
        <div className="w-full h-svh grid place-items-center bg-background text-foreground">
          <Loader2 className="animate-spin size-8" aria-hidden />
        </div>
      ) : (
        children
      )}
=======
      {!loading && children}
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
