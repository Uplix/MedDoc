import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
// import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "./initialize";

/**
 * Sign in using Google popup and ensure user document exists in Firestore.
 */
// export async function signInWithGoogle() {
//   const result = await signInWithPopup(auth, provider);
//   const user = result.user;
//   await createUserDocumentIfNotExists(user);
//   return user;
// }

// export async function registerWithEmail(email, password, extra = {}) {
//   const credential = await createUserWithEmailAndPassword(auth, email, password);
//   const user = credential.user;
//   await createUserDocumentIfNotExists(user, extra);
//   return user;
// }

export async function loginWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout() {
  return signOut(auth);
}

export function onAuthStateChangedListener(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Create a user document in Firestore if it doesn't already exist.
 */
// export async function createUserDocumentIfNotExists(userAuth, extra = {}) {
//   if (!userAuth) return;
//   const userRef = doc(db, "users", userAuth.uid);
//   const snap = await getDoc(userRef);
//   if (!snap.exists()) {
//     const { displayName, email } = userAuth;
//     const createdAt = serverTimestamp();
//     try {
//       await setDoc(userRef, {
//         displayName: displayName || null,
//         email: email || null,
//         createdAt,
//         ...extra,
//       });
//     } catch (error) {
//       console.error("Error creating user document", error);
//       throw error;
//     }
//   }
//   return userRef;
// }
