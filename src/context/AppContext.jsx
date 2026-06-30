import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, collection, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from '../firebase';
import { BASE_ING } from '../data/ingredients';
import { BASE_RECIPES } from '../data/recipes';
import { makeOps } from '../utils/ops';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [userProfile, setUserProfile] = useState(null);
  const [devData, setDevData] = useState({ customRecipes: {}, customIngredients: {} });
  const [activeEvents, setActiveEvents] = useState([]);
  
  const userRef = useRef(null);
  useEffect(() => {
    userRef.current = { uid: user?.uid || "", name: userProfile?.name || "" };
  }, [user, userProfile]);

  const ops = useMemo(() => makeOps(db, () => userRef.current), []);

  // Firebase Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async fbUser => {
      if (fbUser) {
        setUser(fbUser);
        const snap = await getDoc(doc(db, "users", fbUser.uid));
        if (snap.exists()) {
          setUserProfile(snap.data());
        } else {
          const profile = { name: fbUser.email, email: fbUser.email, role: "staff" };
          await setDoc(doc(db, "users", fbUser.uid), profile);
          setUserProfile(profile);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setActiveEvents([]);
      }
    });
    return unsub;
  }, []);

  // Firestore real-time active events listener (Only non-archived events)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "events"), where("archived", "==", false));
    const unsub = onSnapshot(q, snap => {
      setActiveEvents(snap.docs.map(d => d.data()));
    });
    return unsub;
  }, [user]);

  // Config (custom recipes/ingredients) — real-time from Firestore
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "config", "restaurantData"), snap => {
      if (snap.exists()) {
        setDevData(snap.data());
      } else {
        setDoc(doc(db, "config", "restaurantData"), { customRecipes: {}, customIngredients: {} });
      }
    });
    return unsub;
  }, [user]);

  const mutDev = useCallback(fn => {
    setDevData(prev => {
      const next = fn(prev);
      setDoc(doc(db, "config", "restaurantData"), next, { merge: true }).catch(console.error);
      return next;
    });
  }, []);

  const ING = useMemo(() => ({ ...BASE_ING, ...(devData.customIngredients || {}) }), [devData]);
  const RECIPES = useMemo(() => ({ ...BASE_RECIPES, ...(devData.customRecipes || {}) }), [devData]);

  const role = userProfile?.role || "staff";
  const isOwner = role === "owner";
  const isMgr = role === "manager" || role === "owner";
  const userName = userProfile?.name || "";
  const userEmail = userProfile?.email || user?.email || "";
  const currentUserId = user?.uid || "";

  const value = {
    user,
    userProfile,
    activeEvents,
    devData,
    mutDev,
    ING,
    RECIPES,
    role,
    isOwner,
    isMgr,
    userName,
    userEmail,
    currentUserId,
    ops
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
