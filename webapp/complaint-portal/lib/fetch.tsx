"use client";

import { Report, UserProfile } from "./types";
// import { getCurrentUser, setCurrentUser } from "@/lib/context"


/**
 * @param userid null (Current User)
 * @param postedBy null (All Users)
 * @param count 10
 */
export async function fetchReports(
  userid : number | null = null,
  postedBy : number | null = null,
  count : number = 10
) : Promise<Report[]>
{
  let reports : Report[] = [];
  if(userid === null){
    // userid = getCurrentUser().userid;
  }
  if(postedBy === null){
    postedBy = -1;
  }

  try {
    const response = await fetch("/api/getPosts",
       {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userid : userid,
            postUser : (postedBy == -1) ? "*" : postedBy,
            count : count
            })
      });

    const data = await response.json();

    for(let i=0;i<data.length; i++){
      reports.push(
        data[i]
      )
    }
    return reports;
  }
  catch(err){
    throw new Error("Database Error")
  }

}


/**
 *
 * @param userid UserId of the profile to get
 * @returns
 */
export async function fetchUserProfile(
  userid : number,
  cuserid : number | null
) : Promise<UserProfile>
{
  let UserProfile : UserProfile;
  // number cuserid = getCurrentUser().userid;

  try {
    const response = await fetch("/api/getUserProfile",
       {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userid : userid,
            cuserid : cuserid
            })
      });

    const data = await response.json();
    return data;

  }
  catch(err){
    throw new Error("Database Error")
  }

}