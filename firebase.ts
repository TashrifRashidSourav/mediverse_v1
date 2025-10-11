// Firebase v9 compat (v8-style API)
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import { firebaseConfig } from "./firebaseConfig";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// ---- Firestore ----
const db = firebase.firestore();

// TS-safe: compat supports experimentalForceLongPolling; remove useFetchStreams
db.settings({
  experimentalForceLongPolling: true,
  // experimentalAutoDetectLongPolling: true, // optional; you can add this too
});

// Optional: persistence (comment out if it causes issues in your browser)
firebase
  .firestore()
  .enablePersistence({ synchronizeTabs: true })
  .catch((err) => {
    console.warn("[Firestore] persistence not enabled:", err?.code || err);
  });

// Debug logs while diagnosing; comment out when done.
// @ts-ignore
firebase.firestore.setLogLevel?.("debug");

// ---- Auth ----
const auth = firebase.auth();
const storage = firebase.storage();

/**
 * Dev helper: email/password login.
 * Create this user in Firebase Console → Authentication → Users.
 */
export async function loginDevWithEmail(email: string, password: string) {
  const cred = await auth.signInWithEmailAndPassword(email, password);
  console.log("[Auth] Dev login OK:", cred.user?.uid);
  return cred.user;
}

export { auth, db, storage, firebase };