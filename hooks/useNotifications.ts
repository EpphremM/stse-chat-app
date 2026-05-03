"use client";

import { useEffect, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { User } from "firebase/auth";

export const useNotifications = (user: User | null) => {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !user) return;

    const requestPermission = async () => {
      try {
        const msg = await messaging;
        if (!msg) return;

        const status = await Notification.requestPermission();
        setPermission(status);

        if (status === "granted") {
          // Register service worker
          if ("serviceWorker" in navigator) {
            try {
              await navigator.serviceWorker.register("/firebase-messaging-sw.js");
              console.log("Service Worker registered successfully");
            } catch (err) {
              console.error("Service Worker registration failed:", err);
            }
          }
          
          const token = await getToken(msg, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });

          if (token) {
            // Save token to user document
            await updateDoc(doc(db, "users", user.uid), {
              fcmToken: token,
            });
          }
        }
      } catch (err) {
        console.error("Error setting up notifications:", err);
      }
    };

    requestPermission();

    // Foreground listener
    const setupListener = async () => {
      const msg = await messaging;
      if (!msg) return;
      
      return onMessage(msg, (payload) => {
        console.log("Foreground message received:", payload);
        // You could show a custom toast here
        if (Notification.permission === "granted") {
          new Notification(payload.notification?.title || "New Message", {
            body: payload.notification?.body,
            icon: "/icon.png",
          });
        }
      });
    };

    const unsubscribe = setupListener();
    return () => {
      unsubscribe.then(unsub => unsub?.());
    };
  }, [user]);

  return { permission };
};
