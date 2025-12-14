"use client";
import { useState } from "react";
import ReportCard from "@/components/ReportCard";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  aadhaar: string;
  age: number;
  followers: number;
  following: number;
  credits: number;
  photo: string;
};

type Report = {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  image: string;
  votes: number;
  user: UserProfile;
};


//POPULATE PAGE BY FETCT TOP POSTS
export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      title: "Pothole in MG Road",
      description: "Large pothole causing accidents",
      location: "MG Road",
      category: "Road",
      image: "/uploads/pothole.jpg",
      votes: 12,
      user: {
        id: "u1",
        name: "Anand",
        email: "anand@example.com",
        phone: "9999999999",
        aadhaar: "123412341234",
        age: 22,
        followers: 50,
        following: 10,
        credits: 100,
        photo: "https://i.pravatar.cc/80?img=5",
      },
    },
  ]);

  const handleVote = (reportId: string, delta: number) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? { ...report, votes: report.votes + delta }
          : report
      )
    );
  };

  return (
    <div className="p-4 bg-green-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
          All Reports
        </h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} onVote={handleVote} />
          ))}
        </div>
      </div>
    </div>
  );
}
