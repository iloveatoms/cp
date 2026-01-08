"use client";
import { useEffect, useState } from "react";
import ReportCard from "@/components/ReportCard";
import type { Report } from "@/components/ReportCard";

export default function ReportsPage() {
  const [storedUserId, setUserId] = useState<string>("-1");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const requestBody = {
        userid: storedUserId, // Access id
        postUser: "any", // This could be "this user" or "any" #Filter
        count: 10,
      };

      const response = await fetch("/api/getPosts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reports.");
      }

      const data = await response.json();
      setReports(data); // Assuming "reports" contains the type Report data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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

    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  const handleVote = (updatedReport: Report, action: string) =>
  {
    if (storedUserId === "-1") { setError("Please log in to vote."); return; }
    updateLikes(updatedReport, action);
  };


  // -------------- INIT --------------
  useEffect(() => {
    setUserId(localStorage.getItem("userid") || "-1");
  }, []);

  useEffect(() => {
    fetchReports();
  }, []);


  if (loading) {
    return (
      <div className="p-4 bg-green-50 min-h-screen">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-green-800 mb-6">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
          All Reports
        </h1>

        {/* Mini Popup for Error */}
        {error && (
          <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg transition-all duration-300">
            <p>{error}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
