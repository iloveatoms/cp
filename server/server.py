import asyncio
from aiohttp import web
import json
import database
import os
from pprint import pprint as pp


# Database
userdb = database.User('../databases/users.db')
postsdb = database.Post('../databases/users.db')
likesdb = database.Likes('../databases/users.db')

async def initDatabase():
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(userdb.initConnection())
        t2 = tg.create_task(postsdb.initConnection())
        t3 = tg.create_task(likesdb.initConnection())

    print("User Database: ", "Connected" if t1.result() == True else "Error")
    print("Post Database: ", "Connected" if t2.result() == True else "Error")
    print("Likes Database: ", "Connected" if t3.result() == True else "Error")

async def closeDatabase():
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(userdb._close())
        t2 = tg.create_task(postsdb._close())
        t3 = tg.create_task(likesdb._close())



## Admin API
async def index(request):
    with open('admin.html') as f:
        INDEX_FILE = f.read()

    return web.Response(
        text=INDEX_FILE,
        content_type='text/html'
        )

async def uploads(request):
    path = request.match_info.get("path","admin.jpg")

    if not os.path.exists("../uploads/" + path):
        path = "admin.jpg"
    return web.FileResponse("../uploads/" + path)

async def ooo(request):
    data = await request.json()

    action = data["action"]
    table = data["table"]

    msg = {"status":"error"}

    if action == "SELECT":
        if table == "user":
            columns = "aadhar, name, age, phone, bio, email, credits, dateOfCreation, followers, following"

            if data.get("columns"):
                columns = ",".join(data["columns"]) #SQL Injection 🤩
        elif table == "post":
            columns = "*"

        if data.get("limit"):
            limit = data["limit"]
            if isinstance(limit, int):
                cmd += " LIMIT {limit}"

        cmd = f"SELECT {columns} FROM {table}"

    cur = await userdb.cursor()
    await cur.execute(cmd)
    rows = await cur.fetchall()

    if rows:
        headers = [i[0] for i in cur.description]
        msg["status"] = "success"
        msg["headers"] = headers
        msg["rows"] = rows

    await cur.close()

    msg = json.dumps(msg)
    return web.Response(text=msg, content_type="application/json")



## Web API
async def register(request):
    data = dict(await request.json())

    if (await userdb.getUser(data["userid"])) is not None:
        msg = {"user": "exists"}
        return web.Response(text=json.dumps(msg), content_type="application/json", status=409)

    data["meta"]["password"] = database.hash_password(data["meta"]["password"])

    # !!!
    await userdb.createUser(**data)

    msg = {"user": "created"}
    return web.Response(text=json.dumps(msg), content_type="application/json", status=201)

async def login(request):
    data = dict(await request.json())

    userid = data.get("userid")
    password = data.get("password")

    msg = {"authenticated": False}

    if not userid or not password:
        msg["reason"] = "Invalid Login Details"

    elif (await userdb.verifyPassword(userid, password)):
        msg["authenticated"] = True
        return web.Response(text=json.dumps(msg), content_type="application/json")
    else:
        msg["reason"] = "Wrong UserID or Password"

    return web.Response(text=json.dumps(msg), content_type="application/json")



async def updateUser(request):
    data = dict(await request.json())
    userid = data.pop("userid", None)

    if not userid:
        return web.Response(
            status=301,
            text="No Operation",
            content_type="text/html"
        )

    for key, value in data.items():
        await userdb.setValue(userid, key, value)

    return web.Response(
        text=json.dumps({"status": "updated"}),
        content_type="application/json"
    )


async def createPost(request):
    data = await request.json()
    data = dict(data)

    if (await userdb.getUser(data["userid"]))==None:
        msg = {"user":"not-found"}

    elif (await postsdb.getPost(data["postid"]))==None:
        await postsdb.createPost(**data)
        msg = {"post":"created"}

    msg = json.dumps(msg)

    return web.Response(text=msg, content_type="application/json")

async def updateLikes(request):
    data = await request.json()

    accessUserId = data["userid"]
    postid = data["postid"]
    action = data["action"]


    liked, disliked = await likesdb.setInteraction(accessUserId, postid, action)

    msg = {}
    msg["currentUser"] = {
        "userid" : accessUserId,
        "liked" : bool(liked),
        "disliked" : bool(disliked)
    }

    post = await postsdb.getPost(postid)
    msg["post"] = {
        "postid" : postid,
        "likes"  : post["likes"],
        "dislikes" : post["dislikes"]
    }

    msg = json.dumps(msg)
    return web.Response(text=msg, content_type="application/json")



async def getUserProfile(request):
    data = await request.json()
    data = dict(data)

    userid = data["userid"]
    accessUserId = data["cuserid"]

    # if (userid if private && cuserid follows userid) 😲

    msg = await userdb.getUser(userid)

    if not msg:
        msg = await userdb.getUser(-1)

    msg.pop("meta")
    msg.pop("sessionid")

    msg = json.dumps(msg)
    return web.Response(text=msg, content_type="application/json")

async def getPosts(request):
    data = await request.json()
    data = dict(data)
    pp(data)

    accessUserId = data["userid"]
    postedBy = data["postUser"]
    postCount = data["count"]

    pp(data)
    if postedBy == "*":
        posts =  (await postsdb.getAllPosts() )[:postCount]
    else:
        posts = (await postsdb.getAllPosts(postedBy) )[:postCount]

    for i in range(len(posts)):
        postedUserProfile = await userdb.getUser(posts[i]["userid"])
        if postedUserProfile:
            posts[i]["user"] = postedUserProfile
        else:
            posts[i]["user"] = await userdb.getUser(-1) # Deleted User = Admin 😂
            posts[i]["user"]["name"] += "<sub>Deleted By Admin</sub>"
            posts[i]["user"]["userid"] = posts[i]["userid"]

        posts[i]["user"].pop("meta")
        posts[i]["user"].pop("sessionid")


        accessUserProfile = {}
        accessUserProfile["userid"] = accessUserId
        userPostInteraction = await likesdb.getInteraction(accessUserId,posts[i]["postid"])

        if accessUserId == -1 or not userPostInteraction:
            accessUserProfile["postLiked"] = False
            accessUserProfile["postDisliked"] = False
        else:
            accessUserProfile["postLiked"] = userPostInteraction["liked"]
            accessUserProfile["postDisliked"] = userPostInteraction["disliked"]

        posts[i]["currentUser"] = accessUserProfile


    posts = json.dumps(posts)
    return web.Response(text=posts, content_type="application/json")




    # Server API
app = web.Application()
app.add_routes([
    # ADMIN
    web.get('/', index),
    web.get('/uploads/{path}', uploads),
    web.post('/', ooo),

    # USER
    web.post('/getUserProfile', getUserProfile),
    web.post('/getPosts', getPosts),
    web.post('/updateLikes', updateLikes),

    web.post("/register", register),
    web.post("/login", login),

    web.post('/updateUser', updateUser),
    web.post('/post', createPost)
])

asyncio.run(initDatabase())
web.run_app(app,host="localhost", port=9999)
asyncio.run(closeDatabase())
