"use client";

import { UserProfile, Report } from "@/lib/types";
import ReportCard  from "./ReportCard";
import { Button } from "./ui/button";
import { toast } from "react-toastify";

type Props = {
  user: UserProfile;
  reports: Report[],
  onVote: (updatedReport : Report, action: string) => void;
};

export default function UserProfileModal({ user, reports, onVote }: Props) {

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
          <Button onClick={
            ()=>{
              localStorage.clear();
              toast.info("Log-Out successful");
              setTimeout(()=>{window.location.replace("/")},1500);
            }}>
            Logout
          </Button>
        </div>
      </div>


      <div className="w-[70%] p-8 bg-background">
        <div className="h-full rounded-xl border border-dashed border-border flex items-center justify-center text-muted-foreground">
        {
          reports.length > 0
          ? (
            reports.map((report) => (
              <ReportCard
                key={report.postid}
                report={report}
                onVote={onVote}
              />
            )))
          : ( <span>You have No Reports</span>)
        }

        </div>
      </div>
    </div>
  );
}

