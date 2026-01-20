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

export type Report = {
  postid: string,
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
    gps : {
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