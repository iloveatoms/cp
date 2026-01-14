"use client";
import { useEffect, useState } from "react";
import ReportCard from "@/components/ReportCard";
import type { Report } from "@/lib/types";
import {toast} from "react-toastify";
import * as sys from "@/lib/fetch";

export default function ReportsPage() {
  const [storedUserId, setUserId] = useState<number>(-1);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageTitle, setPageTitle] = useState<string>("All Reports");


  const renderReports = async () => {
    setLoading(true);

    try{
      const data = await sys.fetchReports(storedUserId, null, 10);
      if (data.length > 0){
        setReports(data); //data is assumed type Report[]
        setPageTitle("All Reports");
      }
      else{
        setPageTitle("No Reports Available");
      }
    } catch (err) {
      toast.error(err instanceof Error ? "Network Error \n" + err.message : "Network Error");
    } finally {
      setLoading(false);
    }
  };

  const updateLikes = async (updatedReport : Report, action: string) => {
    try {
      const response = await fetch("/api/updateLikes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: storedUserId,
          postid: updatedReport.postid,
          action: action // "liked" or "disliked" or "neutral"
        }),
      });

      if (!response.ok) { throw new Error("Server: Failed to update post."); }
      const result = await response.json();
      console.log(result);
      if(result){
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.postid === updatedReport.postid
              ? { ...report,
                likes: result.post.likes,
                dislikes: result.post.dislikes,
                currentUser : {
                  ...result.currentUser
                }
              }
              : report
          )
        );
      }

    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleVote = (updatedReport: Report, action: string) =>
  {
    if (storedUserId === -1) { toast.error("Please log in to vote."); return; }
    updateLikes(updatedReport, action);
  };

  useEffect(()=>{
    if(typeof window !== "undefined"){
      const tmp = localStorage.getItem("userid");
      if (tmp){ setUserId(Number(tmp)) }
    }
  },[]);

  useEffect(() => {
    if(typeof window !== "undefined"){
      renderReports();
    }
  }, [storedUserId]);


  if (loading) {
    return (
      <div className="dark p-4 min-h-screen">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-green-800 mb-6">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="dark p-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
          {pageTitle}
        </h1>

        <div className="dark grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <ReportCard
              key={report.postid}
              report={report}
              onVote={handleVote}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
