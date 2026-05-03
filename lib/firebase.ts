import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
<<<<<<< HEAD
=======
import { getStorage } from "firebase/storage";
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
<<<<<<< HEAD
=======
const storage = getStorage(app);
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5

// Messaging may not be supported in all environments (e.g. server-side or some browsers)
const messaging = typeof window !== "undefined" ? 
  isSupported().then(supported => supported ? getMessaging(app) : null) : 
  Promise.resolve(null);

<<<<<<< HEAD
export { app, auth, db, messaging };
=======
export { app, auth, db, storage, messaging };
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
