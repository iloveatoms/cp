// "use client"

// import { UserProfile } from "@/lib/types";
// import { useState, useEffect } from "react";


// const [myUserProfile, setMyUserProfile] = useState<UserProfile>(
//   {
//     userid: -1,
//     name: "",
//     email: "",
//     phone: "",
//     aadhaar: "",
//     age: 0,
//     followers: 0,
//     following: 0,
//     credits: 0,
//     dateOfCreation: "",
//     profileUrl: "",
//     bio: ""
//   }
// );

// useEffect( ()=>{
//   if(window !== undefined){
//     const userid = localStorage.getItem("userid");
//     try{
//       if (userid !== null)
//         setMyUserProfile((prev)=>(
//           { ...prev, userid : Number(userid) }
//         ))
//     }
//     catch(err){
//       throw new Error(
//         "Error" + ((err instanceof Error) ? err.message : "")
//       )
//     }
//   }
// },[]);

// export function setCurrentUser(userProfile : UserProfile){
//   setMyUserProfile(userProfile);
// }

// export function getCurrentUser() : UserProfile{
//   return myUserProfile;
// }

// export function getUserId() : number{
//   return myUserProfile.userid;
// }

// export function isUserLoggedIn() : boolean{
//   return (myUserProfile.userid !== -1)
// }

// export default { myUserProfile }