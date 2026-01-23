"use client";

import { response } from "express";
import { Report, UserProfile } from "./types";
import { Response } from "./types";


export async function fetchReports(
  {
    userid = -1,
    postedBy,
    count,
    postid,
    postids,
    range,
    sortBy,
  }: {
    userid?: number,
    postedBy?: number | string,
    count?: number,
    postid?: number,
    postids? : number,
    range?: [number, number],
    sortBy?: string
  }
) : Promise<Report[]>
{
  let reports : Report[] = [];
  if(postedBy === null){ postedBy = -1; }

  let POST_DATA : any = { userid : userid,  }

  if(postid){ POST_DATA.postid = postid; }

  else{
    if(count === undefined){ count = 10; }
    if(range === undefined){ range = [0, count] }
    if(postedBy === undefined){ postedBy = "*" }

    POST_DATA.lbound = range[0];
    POST_DATA.ubound = range[1];
    POST_DATA.postedBy = postedBy;
  }

  try {
    const response = await fetch("/api/getPosts",
       {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(POST_DATA)
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
 * @param updatedReport
 * @param action
 * @param userid
 */
export async function updateLikes(updatedReport : Report, action: string, userid : number)
 : Promise<Response<Report>>
  {
  let myResponse : Response<Report> = { success : false , message : "error"}
  try {
    const response = await fetch("/api/updateLikes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userid: userid,
        postid: updatedReport.postid,
        action: action // "liked" or "disliked" or "neutral"
      }),
    });

    if (!response.ok) { throw new Error("Server: Failed to update post."); }
    const result = await response.json();
    if(result){
      updatedReport.currentUser = result.currentUser;
      updatedReport.likes = result.post.likes;
      updatedReport.dislikes = result.post.dislikes;

      myResponse = { data : updatedReport, success : true }
    }
    return myResponse;
  }
  catch(err){ throw new Error("Network Error : Cannot update Likes.") }
}



/**
 * @param userid UserId of the profile to get
 * @returns
 */
export async function fetchUserProfile(
  userid : number,
  cuserid : number | null
) : Promise<UserProfile>
{
  let userProfile : UserProfile;
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

    userProfile = data;
    return userProfile;

  }
  catch(err){
    throw new Error("Database Error")
  }

}