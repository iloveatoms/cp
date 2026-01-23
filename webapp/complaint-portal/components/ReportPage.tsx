"use client";
import { useEffect, useState } from "react";
import ReportCard from "@/components/ui/ReportCard";
import type { Report, Response } from "@/lib/types";
import {toast} from "react-toastify";
import * as sys from "@/lib/fetch";



type ReportPageProps = {
  userid : number,
  postedBy? : number | "*";
  selectOnly? : number[];
  pageTitle? : string;
  minimal? : boolean;
  className?: string;
}

const ReportPage = ({ userid , selectOnly = [], pageTitle = "All Reports", postedBy = "*", minimal = false, className = ""} : ReportPageProps ) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [finalReports, setFinalReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageTitleToShow, setPageTitle] = useState<string>(pageTitle);

  const renderReports = async () => {
    setLoading(true);
    try{
      const data = await sys.fetchReports({userid : userid, postedBy : postedBy});
      if (data.length > 0){
        setReports(data); //data is assumed type Report[]
        setPageTitle(pageTitle);
      } else{ setPageTitle("No Reports Available"); }
    }
    catch (err) { toast.error(err instanceof Error ? "Network Error \n" + err.message : "Network Error"); }
    finally { setLoading(false); }
  };

  const onVote = async (updatedReport : Report, action : string)=>{
    const resp : Response<Report> = await sys.updateLikes(updatedReport, action, userid);
    if(resp.success === true){
      setReports((prevReports)=>(
        prevReports.map((prevReport)=>(
          prevReport.postid === updatedReport.postid ? updatedReport : prevReport
        ))
      ))
    }
    else{ toast.info("Error updating votes" + resp.message) }
  }

  useEffect(() => {
    if(typeof window !== "undefined"){ renderReports(); }
  }, [userid]);

  useEffect(() => {
    if (selectOnly.length === 0){ setFinalReports(reports) }
    else{
        setFinalReports(
        reports.filter((r) => selectOnly.includes(r.postid))
      );
    }
  }, [reports, selectOnly]);


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
    <div className={"dark p-4 min-h-screen " }  >
      <div className="max-w-6xl mx-auto">
          { !minimal && (
            <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
              {pageTitleToShow}
            </h1>
          )}

        <div className={"grid gap-6 grid-cols-[repeat(auto-fit,minmax(280px,1fr))] justify-items-center justify-between" + className}>
          {
           finalReports.map((fr) =>(
            <ReportCard key={fr.postid} report={fr} updater={ minimal ? undefined : onVote }/>
           ))
          }
        </div>
      </div>
    </div>
  );
}

export default ReportPage;