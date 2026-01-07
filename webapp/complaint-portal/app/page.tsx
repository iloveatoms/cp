"use client";
import { useEffect, useState } from "react";
import ReportCard from "@/components/ReportCard";

type UserProfile = {
  userid: number;
  name: string;
  email: string;
  phone: string;
  aadhaar: string;
  age: number;
  followers: string;
  following: string;
  credits: number;
  dateOfCreation: string;
  profileUrl: string;
  bio: string;
};

type Report = {
  postid: string;
  userid: number;
  dateOfCreation: string;
  title: string;
  text: string;
  imageUrl: string;
  meta: {
    location: string;
    category: string;
    fileName: string;
  };
  likes: number;
  dislikes: number;
  credits: number;
  user: UserProfile;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userid");
    if (!storedUserId) {
      setError("Please log in to vote.");
    }
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(null); // Reset the error before fetching data

    try {
      const storedUserId = localStorage.getItem("userid") || "0";
      const requestBody = {
        userid: storedUserId,
        postType: "any", // This could be "this user" or "any"
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
      setReports(data); // Assuming "reports" contains the report data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updatePost = async (postid: string, newLikes: number) => {
    const storedUserId = localStorage.getItem("userid");
    if (!storedUserId) {
      setError("Please log in to like this post.");
      return;
    }

    try {
      const response = await fetch("/api/updatePost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: storedUserId,
          postid: postid,
          likes: newLikes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update post.");
      }

      const result = await response.json();
      if (result.success) {
        console.log("Post updated successfully");
      } else {
        throw new Error(result.message || "Failed to update post.");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  const handleVote = (postid: string, delta: number) => {
    const storedUserId = localStorage.getItem("userid");

    if (!storedUserId) {
      setError("Please log in to vote.");
      return; // Don't allow vote if user is not logged in
    }

    setReports((prevReports) =>
      prevReports.map((report) =>
        report.postid === postid
          ? { ...report, likes: report.likes + delta }
          : report
      )
    );

    const updatedReport = reports.find((report) => report.postid === postid);
    if (updatedReport) {
      updatePost(postid, updatedReport.likes + delta);
    }
  };

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
