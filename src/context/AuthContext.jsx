import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

const AuthContext = createContext();

export const ADMIN_EMAIL = "admin@joebest.com";
export const ADMIN_PASSWORD = "Admin@GSMWorld2024";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function register(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      email,
      displayName,
      role: email === ADMIN_EMAIL ? "admin" : "user",
      createdAt: new Date().toISOString(),
      photoURL: "",
    });
    return cred;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    const userRef = doc(db, "users", cred.user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        role: "user",
        createdAt: new Date().toISOString(),
        photoURL: cred.user.photoURL || "",
      });
    }
    return cred;
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function isAdmin() {
    return userProfile?.role === "admin" || currentUser?.email === ADMIN_EMAIL;
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          console.log("LOGGED IN UID:", user.uid);
          console.log(
            "PROFILE DATA:",
            snap.exists() ? snap.data() : "NO PROFILE DOC FOUND",
          );
          if (snap.exists()) setUserProfile(snap.data());
        } catch (err) {
          console.error("Failed to load user profile:", err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        register,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        isAdmin,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
