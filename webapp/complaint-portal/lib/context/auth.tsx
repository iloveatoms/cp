"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, init_UserProfile } from "../types";
import { fetchUserProfile } from "../fetch";


const AuthContext = createContext<{ userProfile: UserProfile, setUserProfile: (userProfile: UserProfile) => void; } | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [userProfile, setUserProfile] = useState<UserProfile>(init_UserProfile);

  useEffect(() => {
    if(typeof window !== "undefined")
    {
      let cuserID = localStorage.getItem("userid");
      if(cuserID === null){ cuserID = "-1" }

      async function loadUserProfile() {
        const userProfileTmp = await fetchUserProfile(Number(cuserID),Number(cuserID));
        setUserProfile(userProfileTmp);
      }

      loadUserProfile();
    }

  }, []);

  useEffect( ()=>{
    localStorage.setItem("userid",String(userProfile.userid));
  },[userProfile]);

  return (
    <AuthContext.Provider value={{ userProfile, setUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}



