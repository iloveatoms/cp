"use client";

import UserProfileModal from "@/components/UserProfileModal";
import { useAuthContext } from "@/lib/context/auth";

export default function ReportsPage() {
  const {userProfile} = useAuthContext();


  return (

      userProfile && (
      <UserProfileModal
      user={userProfile}
      />)

  );
}
