"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState, useRef } from "react";
import { useAuthContext } from "@/lib/context/auth";
import { fetchReports } from "@/lib/fetch";
import ReportCard from "@/components/ui/ReportCard";
import { Report } from "@/lib/types";


export default function MapView() {
  const {userProfile} = useAuthContext();

  const cuserID = userProfile.userid;

  const reviewedIconConf = {
    iconUrl: "/leaflet/marker-green.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowUrl: ""
  }

  const rejectedIconConf = {
    iconUrl: "/leaflet/marker-red.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowUrl: ""
  }


  const underReviewIconConf = {
    iconUrl: "/leaflet/marker-gold.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowUrl: ""
  }

  const mapRef = useRef<any>(null);
  const leafRef = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(null);
  const iconsRef = useRef<any>(null);

  const [reports, setReports] = useState<Report[]>([]);
  const [showPopUp, setShowPopUp] = useState<Report>();


  function toggleFullscreen(e : React.MouseEvent<HTMLDivElement>) {
    if (document.fullscreenElement) { document.exitFullscreen(); }
    else {
        (e.target as HTMLDivElement).parentElement?.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
      }
  }

  function updateMarkers(L : any, map: any, markersList: Map<number, any> , icons: any ,  reports: Report[]) {

    reports.forEach((r) => {
      if(!r.meta.gps) {return;} //Skip if r.meta.gps is not defined;

      let rMarker = markersList.get(r.postid);

      // If marker exists
      if(rMarker){ rMarker.off('click'); }
      else{
        rMarker = L.marker([r.meta.gps.latitude, r.meta.gps.longitude], { icon: icons[r.meta.status] }).addTo(map);
      }

      rMarker.on('click', ()=>{ setShowPopUp(r) });
      markersList.set(r.postid, rMarker);
    });
  }

  async function loadAllReports(){
    try{ const resp = await fetchReports({userid : cuserID})
    if(resp.length > 0) setReports(resp); }
    catch (err : any){ console.log(err.message) }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    let LATITUDE = 13.0;
    let LONGITUDE = 77.6;
    let ZOOM = 12.5;

    const searchParams = new URLSearchParams(window.location.search);

    const latParam = Number(searchParams.get("latitude"));
    const lngParam = Number(searchParams.get("longitude"));
    const zParam = Number(searchParams.get("z"));

    if (latParam !== 0) {LATITUDE = latParam;}
    if (0 !== lngParam){ LONGITUDE = lngParam;}
    if (0 !== zParam) {ZOOM = zParam;}

    // LEAFLET \\
    const L = require("leaflet");
    var map = L.map("map").setView([ LATITUDE, LONGITUDE ], ZOOM);
    L.Icon.Default.mergeOptions({ iconUrl: '/leaflet/marker-icon.png', iconRetinaUrl: '/leaflet/marker-icon-2x.png', shadowUrl: '/leaflet/marker-shadow.png' });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    map.on('click',()=>{ setShowPopUp(undefined) })

    const myIcons ={
      "reviewed" : L.icon(reviewedIconConf),
      "rejected" : L.icon(rejectedIconConf),
      "underReview" : L.icon(underReviewIconConf)
    };

    leafRef.current = L;
    mapRef.current = map;
    markersRef.current = new Map<number, any>();
    iconsRef.current = myIcons;



    loadAllReports();

    return () => { map.remove(); };
  }, []);

  useEffect(()=>{
    if (typeof window === "undefined") return;
    if (!markersRef.current || !leafRef.current || !mapRef.current || !iconsRef.current || reports.length === 0) return;

    updateMarkers(leafRef.current, mapRef.current, markersRef.current, iconsRef.current, reports);
  },[reports]);

  return (
    <div id="container" className="relative w-full h-[77vh]"
    onKeyDown={(e) => {
      if (e.key === "f") toggleFullscreen(e as unknown as React.MouseEvent<HTMLDivElement>);
    }}>
      <div id="fbutton" className="absolute bottom-4 left-4 p-2 w-8 h-8 z-9999 flex items-center justify-center cursor-pointer"
        onClick={toggleFullscreen}>😀</div>

      <div id="popup" className="absolute top-4 right-4 h-0.5 z-9999">
        { (showPopUp !== undefined) && <ReportCard report={showPopUp}/>}
      </div>
    <div id="map" className="absolute inset-0 w-full h-full"/></div>
  );
}

