import express, { Request, Response } from 'express'
import path from 'path'
import multer from 'multer'
import cors from 'cors'
import sharp from 'sharp'
import exifReader from "exif-reader";
import { randomBytes } from 'crypto'

const dbHost =  "http://localhost:9999"
const SERVE_DIR = path.join(__dirname, 'build')
const UPLOAD_DIR = path.join(__dirname, '..', '..',"uploads"); //Root resource




function parseCookie(req: any, res: any, next: (err?: any) => void){
  let d: any = new Object()
  if (req.headers.cookie === undefined){
    req.cookies = {}
  }
  else{
    let cookies: string[] = req.headers.cookie.split('; ')
    cookies.forEach(e=> {
      var cookie: string[]= e.split("=")
      d[cookie[0]] = cookie[1]
    })

    req.cookies = {}
  }
  next()
}

function convertDMSToDD(dms : any, ref : any) {
  const [degrees, minutes, seconds] = dms;
  let dd = degrees + minutes / 60 + seconds / 3600;

  if (ref === "S" || ref === "W") {
    dd = -dd;
  }
  return dd;
}

async function getGeo(filePath : string) : Promise<Object | undefined>{
  try {

    const metadata = await sharp( path.join(UPLOAD_DIR , filePath) ).metadata();
    let gps = undefined;

    if(metadata.exif){
      const geo = exifReader(metadata.exif);
      if(geo && geo.GPSInfo){
            gps = {
              latitude: convertDMSToDD(
                geo.GPSInfo.GPSLatitude,
                geo.GPSInfo.GPSLatitudeRef
              ),
              longitude: convertDMSToDD(
                geo.GPSInfo.GPSLongitude,
                geo.GPSInfo.GPSLongitudeRef
              ),
              altitude: geo.GPSInfo.GPSAltitude ?? null,
              date : geo.GPSInfo.GPSDateStamp ?? "0:0:0",
              time : (geo.GPSInfo.GPSTimeStamp ?? [0,0,0]).join(":")
            };
      }
    }
    return gps;

  } catch (error) {
    console.error(`Metadata Processing Error: ${error}`);
    return undefined;
  }
}


type ComplaintRequest = Request & { file?: Express.Multer.File }
const upload = multer({ dest: UPLOAD_DIR })

const app = express()
app.use(cors())
app.use(express.json())
app.use(parseCookie)
app.use(express.urlencoded({extended: true}))
app.use(express.static(SERVE_DIR))
app.use("/uploads",express.static(UPLOAD_DIR))

app.post('/api/register',async(req,res)=>{

  let sessionID = String(randomBytes(10));
      res.cookie("sessionID", sessionID, {
        maxAge: 900000,
        httpOnly: true,
        sameSite: "strict"
        })

  let createUser = {
          userid: Number(req.body.aadhaar),
          name: req.body.name,
          email: "--",
          phone: "--",
          aadhar: Number(req.body.aadhaar),
          age: 0,
          followers: 0,
          following: 0,
          credits: 0,
          dateOfCreation: Date.now().toString(),
          profileUrl: "uploads/user.jpg",
          bio: "",
          meta: {password: req.body.password},
          sessionid: sessionID
        }

        res.contentType("application/json")

        // POST to database.
        const resp = await fetch(dbHost + "/register", {
            method: "POST",
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body : JSON.stringify(createUser)
          })

        const data = await resp.json();
        res.contentType("application/json")
        res.status(200).json({status:data.user})

})

app.post(
  '/api/login',
  async (req, res) =>{
        let loginUser = {
          userid: Number(req.body.userid),
          password:req.body.password
        }

        res.contentType("application/json")

        // POST to database.
        const resp = await fetch(dbHost + "/login", {
            method: "POST",
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body : JSON.stringify(loginUser)
          })

        const data = await resp.json();

        if (data["authenticated"] === false){
          res.contentType("application/json");
          res.status(200)
            .json({
            authenticated : false,
            reason: data.reason
          });
        }
        else if(data["authenticated"] === true){
          res.contentType("application/json");
          res.status(200)
           .send({
             authenticated : true,
             userid: loginUser.userid
          });
        }
    }
)

app.get(
  '/api/logout', (req, res) => {
    res.clearCookie('sessionID');
    res.redirect('/');
})


app.post(
  '/api/complaints',
   upload.single('image'),
   async (req: ComplaintRequest, res: Response) => {

   let geoMeta = null;
   if(req.file){
     geoMeta = await getGeo(req.file.filename);
   }
   else{
    res.status(201).json({message: "no-image" })
    return
   }

    let createPost = {
      "postid": Date.now().toString(),
      "userid": Number(req.body.aadhaar),
      "dateOfCreation": Date.now().toString(),
      "title" : req.body.title,
      "text": req.body.description,
      "imageUrl" : "uploads/" + req.file?.filename,
      "meta": { location: req.body.location,
                category: req.body.category,
                fileName: req.file?.originalname,
                status: "underReview",
                statusDate: 0,
                gps: geoMeta
              },
      "likes": 0,
      "dislikes":0,
      "credits":0
    }


    //Get geo-location
    console.log(geoMeta);

    //POST to users.db
    const resp = await fetch(dbHost + "/post", {
    method: "POST",
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body : JSON.stringify(createPost)
      })
    if (!resp.ok){ res.status(resp.status).json({error: 'Failed;;'}) }

    const data = await resp.json()

    res.status(201).json({
      ...data,
      message: function(){
        if(data["user"] == "not-found"){
          console.log({
            user:"not-found",
            postid:createPost.postid,
            userid:createPost.userid}
          );
          return "User does not exist."
        }
        else if(data["post"] == "created"){
          console.log(createPost)
          return "Complaint Received."
          }
      }()
    })

   }
)

app.post('/api/getPosts',
  async (req, res) => {
      const response = await fetch(dbHost + "/getPosts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req.body)
      });

      if (!response.ok) { throw new Error("Failed to fetch reports."); }

      let data = await response.json();
      res.contentType('application/json');
      res.status(200).json(data)
    }
)

app.post('/api/getUserProfile',
  async (req, res) => {
      const response = await fetch(dbHost + "/getUserProfile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req.body)
      });

      if (!response.ok) { throw new Error("Failed to fetch reports."); }

      let data = await response.json();

      res.contentType('application/json');
      res.status(200).json(data)
    }
)

app.post('/api/updateLikes',
  async (req, res) => {
    const response = await fetch(dbHost + "/updateLikes", {
        method : "POST",
        headers: {
          "Content-Type" : "application/json",
        },
        body : JSON.stringify(req.body)
    });

    const data = await response.json();

    res.contentType("application/json");
    res.status(200).json({

      // type Report.currentUser
      currentUser : {
        userid : req.body.userid,
        postLiked : data["currentUser"]["liked"],
        postDisliked : data["currentUser"]["disliked"]
      },
      post : {
        postid : data["post"]["postid"],
        likes :  data["post"]["likes"],
        dislikes : data["post"]["dislikes"]
      }
    });
  }
)
const PORT = 5000
const HOST = "0.0.0.0"
app.listen(PORT, HOST,  () => {
  console.log(`Backend running at ${HOST}:${PORT}`)
})
