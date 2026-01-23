"use client";

import { UserProfile } from "@/lib/types";
import { Button } from "./ui/button";
import { toast, Zoom } from "react-toastify";
import ReportPage from "./ReportPage";

type Props = {
  user: UserProfile;
};

export default function UserProfileModal({ user }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex bg-black/30 backdrop-blur-sm dark">

      {/* LEFT: Profile (30%) */}
      <div className="w-[30%] min-w-[320px] bg-dark p-6 shadow-xl border-r border-border">
        <h2 className="text-2xl font-semibold mb-4">
          {user.name}&apos;s Profile
        </h2>

        <div className="space-y-2 text-sm">
          <p><strong>User ID:</strong> {user.userid}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Aadhaar:</strong> {user.aadhaar}</p>
          <p><strong>Age:</strong> {user.age}</p>
          <p><strong>Followers:</strong> {user.followers}</p>
          <p><strong>Following:</strong> {user.following}</p>
          <p><strong>Credits:</strong> {user.credits}</p>
          <Button onClick={logOuter}>
            Logout
          </Button>
        </div>
      </div>

      <div className="w-[70%] p-8 dark rounded-2xl border-b-amber-500">
        <ReportPage userid={user.userid} pageTitle="Your Reports" postedBy={user.userid} className="overflow-y-auto"/>
      </div>
    </div>
  );
}

function logOuter(e: React.MouseEvent<HTMLButtonElement>){
  localStorage.clear()
  toast.info('🦄 Log-Out Successful', {
    position: "top-center",
    autoClose: 2600,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
    transition: Zoom,
    });
    setTimeout( ()=>window.location.replace("/") , 1000)
}