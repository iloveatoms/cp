"use client";

import { useAuthContext } from "@/lib/context/auth";
import ReportPage from "@/components/ReportPage";


export default function HomePage() {
  const {userProfile} = useAuthContext();
  return (
    <ReportPage userid={userProfile.userid} />
  )
}
