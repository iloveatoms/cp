import express, { Request, Response } from 'express'
import path, { parse } from 'path'
import multer from 'multer'
import cors from 'cors'
import bodyParser  from 'body-parser'


const dbHost =  "http://localhost:9999"
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

type ComplaintRequest = Request & { file?: Express.Multer.File }
const upload = multer({ dest: path.join(__dirname, '..', '..','uploads') })

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(parseCookie)
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'build')))
app.use(express.static(path.join(__dirname, '..', '..'))) //Root Dir


app.post(
  '/api/login',
  async (req, res) =>{

    // IF no cookie.sessionID
    // THEN SET COOKIE & PROCEDE TO LOGIN
    if(req.cookies.sessionID === undefined){
      let sessionID = "1234abcd"
      res.cookie("sessionID", sessionID, {
        maxAge: 900000,
        httpOnly: true,
        sameSite: "strict"
        })

        let createUser = {
          userid: req.body.aadhaar,
          name: "User" + req.body.aadhaar,
          email: "--",
          phone: "--",
          aadhar: req.body.aadhaar.toString(),
          age: 0,
          followers: "",
          following: "",
          credits: 0,
          dateOfCreation: Date.now().toString(),
          profileUrl: "uploads/user.jpg",
          bio: "",
          meta: {password: req.body.password},
          sessionid: sessionID
        }

        res.contentType("application/json")

        // POST to database.
        const resp = await fetch(dbHost + "/createUser", {
            method: "POST",
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body : JSON.stringify(createUser)
          })
        if (!resp.ok){ res.status(resp.status).json({error: 'Failed;;'}) }
        const data = await resp.json()

        if (data["authenticated"] == "false"){
          res.contentType("text/html")
          res.status(201).send("<h1 style='text-aligh:center;font-size:100px;'>Complaint Portal :: failed login</h1><script>window.alert('Wrong Password'); setTimeout(()=> {window.location.href = '/';},3000)</script>")
        }
        else if(data["authenticated"] == "true" ){
          res.contentType("text/html")
          res.status(201).send(
            "<h1 style='text-aligh:center;font-size:100px;'>Complaint Portal :: Login Success</h1><script>localStorage.setItem('userid','" + createUser["userid"] + "'); setTimeout(()=> {window.location.href = '/';},3000)</script>"
          )}
    }

    else{ res.redirect('/') }
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
    console.log('BODY:', req.body )
    console.log('FILE:', req.file)

    let createPost = {
      "postid": Date.now().toString(),
      "userid": Number(req.body.aadhaar),
      "dateOfCreation": Date.now().toString(),
      "title" : req.body.title,
      "text": req.body.description,
      "imageUrl" : "uploads/" + req.file?.filename,
      "meta": { location:req.body.location, category: req.body.category, fileName: req.file?.originalname},
      "likes": 0,
      "dislikes":0,
      "credits":0
    }

    console.log(createPost)

    //POST to users.db
    const resp = await fetch(dbHost + "/post", {
    method: "POST",
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body : JSON.stringify(createPost)
      })
    if (!resp.ok){ res.status(resp.status).json({error: 'Failed;;'}) }
    const data = await resp.json()


      res.status(201).json({
        message: function(){
          if(data["user"] == "not-found"){ return "Please Login First."}
          else if(data["post"] == "created"){ return "Complaint Received."}
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
      body: JSON.stringify(req.body),
      });

      if (!response.ok) { throw new Error("Failed to fetch reports."); }

      const data = await response.json();
      res.contentType('application/json');
      res.status(200).json(data)
    }
)

const PORT = 5000
const HOST = "0.0.0.0"
app.listen(PORT, HOST,  () => {
  console.log(`Backend running at ${HOST}:${PORT}`)
})
