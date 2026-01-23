export type UserProfile = {
  userid: number;
  name: string;
  email: string;
  phone: string;
  aadhaar: string;
  age: number;
  followers: number;
  following: number;
  credits: number;
  dateOfCreation: string;
  profileUrl: string;
  bio: string;
};


export const init_UserProfile : UserProfile = {
  userid: -1,
  name: "",
  email: "",
  phone: "",
  aadhaar: "",
  age: 0,
  followers: 0,
  following: 0,
  credits: 0,
  dateOfCreation: "",
  profileUrl: "/uploads/user.jpg",
  bio: ""
}


export type Report = {
  postid: number,
  userid: number,
  dateOfCreation: number,
  title: string,
  text: string,
  imageUrl: string,
  meta: {
    location: string,
    category: string,
    fileName: string,
    status: string,
    statusDate : number,
    gps? : {
      longitude : number,
      latitude : number,
      altitude : number,
      date : string,
      time : string
    }
  },
  likes: number,
  dislikes: number,
  credits: number,
  user: UserProfile,
  currentUser : {
    userid : number,
    postLiked : boolean,
    postDisliked : boolean
    // comments : {}
  }
};

export const init_Report : Report = {
  postid: 0,
  userid: -1,
  dateOfCreation: 0,
  title: "",
  text: "",
  imageUrl: "",
  meta: {
    location: "",
    category: "",
    fileName: "",
    status: "",
    statusDate : 0,
    gps : {
      longitude : 0,
      latitude : 0,
      altitude : 0,
      date : "",
      time : ""
    }
  },
  likes: 0,
  dislikes: 0,
  credits: 0,
  user: init_UserProfile,
  currentUser : {
    userid : 0,
    postLiked : false,
    postDisliked : false
    // comments : {}
  }
}



export type Response<T> = {
  success : true;
  data : T;
} | { success : false, message : unknown }
