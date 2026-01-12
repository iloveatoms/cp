"use client";
import { MouseEventHandler, useEffect, useState } from "react";
import { UserProfile, type Report } from "@/lib/types";
import {toast, Zoom} from "react-toastify";
import * as sys from "@/lib/fetch";
import UserProfileModal from "@/components/UserProfileModal";
import React from "react";

export default function ReportsPage() {
  const [storedUserId, setUserId] = useState<number>(-1);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userProfile, setProfile] = useState<UserProfile>()



  const renderProfile = async () => {
    setLoading(true);
    try{
      const data = await sys.fetchUserProfile(storedUserId, storedUserId);
      setProfile(data)
    } catch (err) {
      toast.error(err instanceof Error ? "Network Error \n" + err.message : "Network Error");
    } finally {
      setLoading(false);
    }
  };


  const renderReports = async () => {
    setLoading(true);

    try{
      const data = await sys.fetchReports(storedUserId, storedUserId, 10);
      if (data.length > 0){
        setReports(data); //data is assumed type Report[]
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

  function handleLogout(e : MouseEventHandler<HTMLButtonElement>){
    localStorage.clear()
    toast.info('🦄 Log-Out Successful', {
      position: "top-center",
      autoClose: 1000,
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


  useEffect(()=>{
    if(typeof window !== "undefined"){
      const tmp = localStorage.getItem("userid");
      if (tmp){ setUserId(Number(tmp)) }
    }
  },[]);

  useEffect(()=>{
    renderProfile()
  }, [storedUserId])

  useEffect(() => {
      renderReports();
  }, [storedUserId]);


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

      userProfile && (
      <UserProfileModal
      user={userProfile}
      reports={reports}
      onVote={handleVote}
      />)

  );
}
