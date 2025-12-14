"use client";
import { useState } from "react";
import Link from "next/link";

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

type ReportCardProps = {
  report: Report;
  onVote: (reportId: string, delta: number) => void;
};

function ReportCard({ report, onVote }: ReportCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E1F1E4] shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#F0FBF4]">
        <Link
          href={`/profile?user=${report.user.id}`}
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007ACC] rounded-full"
        >
          <img
            src={report.user.photo}
            alt={report.user.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-[#2C6E49] group-hover:ring-2 group-hover:ring-[#A1D99B] transition"
          />
          <div>
            <p className="text-sm font-semibold text-[#2C6E49] group-hover:text-[#007ACC]">
              {report.user.name}
            </p>
            <p className="text-xs text-[#4D4D4D]">View profile</p>
          </div>
        </Link>
        <span className="text-xs font-semibold text-[#007ACC] bg-[#E1F3FF] px-3 py-1 rounded-full">
          {report.category}
        </span>
      </div>
      <div className="h-44 bg-[#F7F9FA]">
        <img
          src={report.image}
          alt={report.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5 flex-1 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#2C6E49]">{report.title}</h2>
          <p className="text-sm text-[#4D4D4D] mt-1">{report.description}</p>
        </div>
        <div className="text-sm text-[#4D4D4D] space-y-1">
          <p>
            <strong className="text-[#2C6E49]">Location:</strong> {report.location}
          </p>
          <p>
            <strong className="text-[#2C6E49]">Votes:</strong> {report.votes}
          </p>
        </div>
        <div className="mt-auto flex gap-3">
          <button
            type="button"
            className="w-full rounded-full bg-[#2C6E49] text-white py-2 text-sm font-semibold hover:bg-[#24573A] transition-colors"
            onClick={() => onVote(report.id, 1)}
          >
            Support
          </button>
          <button
            type="button"
            className="w-full rounded-full bg-white text-[#E63946] border border-[#F6C5C7] py-2 text-sm font-semibold hover:bg-[#FFF5F5] transition-colors"
            onClick={() => onVote(report.id, -1)}
          >
            Oppose
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReportGallery() {
  const [reports, setReports] = useState<Report[]>(
    [
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
          photo: "/uploads/anand.jpg",
        },
      },
    ]
  );

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
      <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
        All Reports
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} onVote={handleVote} />
        ))}
      </div>
    </div>
  );
}

export default ReportCard;
