import express, { Request, Response } from 'express'
import path, { parse } from 'path'
import multer from 'multer'
import cors from 'cors'
import bodyParser  from 'body-parser'

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
const upload = multer({ dest: path.join(__dirname, '..', '..','databases','uploads') })

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(parseCookie)
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'build')))


app.post(
  '/api/login',
  async (req, res) =>{

    // IF no cookie.sessionID
    // THEN SET COOKIE & PROCEDE TO LOGIN
    if(req.cookies.sessionID === undefined){
      let sessionID = "1234abcd"
      res.cookie('sessionID', sessionID, {
        maxAge: 900000,
        httpOnly: true,
        sameSite: 'strict'
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
          meta: req.body.password.toString(),
          sessionid: sessionID
        }

        res.contentType("application/json")

        // POST to database.
        const resp = await fetch("http://localhost:9999/createUser", {
            method: "POST",
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body : JSON.stringify(createUser)
          })
        if (!resp.ok){ res.status(resp.status).json({error: 'Failed;;'}) }
        const data = await resp.json()

        if (data["authenticated"] == "false"){
          res.contentType("text/html")
          res.status(201).send("<script>window.alert('Wrong Password');</script>")
        }
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
      "meta": req.body.location + ":" + req.body.category,
      "likes": 0,
      "dislikes":0,
      "credits":0
    }

    console.log(createPost)

    //POST to users.db
    const resp = await fetch("http://localhost:9999/post", {
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





app.listen(5000, () => {
  console.log('Backend running at http://localhost:5000')
})
