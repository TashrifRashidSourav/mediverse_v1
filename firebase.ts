// Firebase v9 compat (v8-style API)
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { firebaseConfig } from "./firebaseConfig";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// ---- Firestore ----
const db = firebase.firestore();

// TS-safe: compat supports experimentalForceLongPolling; remove useFetchStreams
// Removing long polling to use faster WebSockets
// Optional fields left undefined (e.g. a walk-in patient with no authUid) are
// skipped instead of making the whole write throw.
db.settings({ ignoreUndefinedProperties: true });

// Optional: persistence (comment out if it causes issues in your browser)
firebase
  .firestore()
  .enablePersistence({ synchronizeTabs: true })
  .catch((err) => {
    console.warn("[Firestore] persistence not enabled:", err?.code || err);
  });

// Debug logs while diagnosing; comment out when done.
// Removed debug logging to improve performance

// ---- Auth ----
const auth = firebase.auth();

/**
 * Storage is only needed for file uploads, so it is loaded on demand
 * instead of being bundled into every page load.
 */
async function getStorage() {
  await import("firebase/compat/storage");
  return firebase.storage();
}

/**
 * Dev helper: email/password login.
 * Create this user in Firebase Console → Authentication → Users.
 */
export async function loginDevWithEmail(email: string, password: string) {
  const cred = await auth.signInWithEmailAndPassword(email, password);
  console.log("[Auth] Dev login OK:", cred.user?.uid);
  return cred.user;
}

export { auth, db, getStorage, firebase };