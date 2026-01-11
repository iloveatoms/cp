from aiohttp import web
import json
import database
from pprint import pprint as pp


userdb = database.Users('../databases/users.db')
postsdb = database.Posts('../databases/users.db')
likesdb = database.Likes('../databases/users.db')



## Admin API
async def index(request):
    with open('admin.html') as f:
        INDEX_FILE = f.read()

    return web.Response(
        text=INDEX_FILE,
        content_type='text/html'
        )

async def ooo(request):
    data = await request.json()

    action = data["action"]
    table = data["table"]

    msg = {"status":"error"}

    if action == "SELECT":
        ## QUERY COMMANDS ##

        # COLUMNS
        columns = "*"
        if data.get("columns"):
            columns = ",".join(data["columns"]) #SQL Injection 🤩

        limit = data["limit"] if data.get("limit") else 10

        # SORT BY
        # WHERE condition


        result = userdb._execute(f"SELECT {columns} FROM {table} LIMIT {limit}")

        if result:
            headers = list(map(lambda i : i[0], result.description))
            rows = result.fetchall()

            msg["status"] = "success"
            msg["headers"] = headers
            msg["rows"] = rows

    msg = json.dumps(msg)
    return web.Response(text=msg, content_type="application/json")



## Web API
async def register(request):
    data = dict(await request.json())

    # required = ["userid", "name", "password", "aadhar"]

    # if not all(k in data for k in required):
    #     msg = {"error": "missing-fields"}
    #     return web.Response(text=json.dumps(msg), content_type="application/json", status=400)

    if userdb.getUser(data["userid"]) is not None:
        msg = {"user": "exists"}
        return web.Response(text=json.dumps(msg), content_type="application/json", status=409)

    data["meta"]["password"] = database.hash_password(data["meta"]["password"])

    userdb.createUser(**data)

    msg = {"user": "created"}
    return web.Response(text=json.dumps(msg), content_type="application/json", status=201)

async def login(request):
    data = dict(await request.json())

    userid = data.get("userid")
    password = data.get("password")

    msg = {"authenticated": False}

    if not userid or not password:
        return web.Response(text=json.dumps(msg), content_type="application/json", status=400)

    if userdb.verifyPassword(userid, password):
        msg["authenticated"] = True
        return web.Response(text=json.dumps(msg), content_type="application/json")

    return web.Response(text=json.dumps(msg), content_type="application/json", status=401)



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
        userdb.setValue(userid, key, value)

    return web.Response(
        text=json.dumps({"status": "updated"}),
        content_type="application/json"
    )


async def createPost(request):
    data = await request.json()
    data = dict(data)

    if userdb.getUser(data["userid"])==None:
        msg = {"user":"not-found"}
    elif postsdb.getPost(data["postid"])==None:
        postsdb.createPost(**data)
        msg = {"post":"created"}
    else:
        msg = {"post":"exists"}

    msg = json.dumps(msg)
    pp(data)
    pp(msg)
    return web.Response(text=msg, content_type="application/json")

async def updateLikes(request):
    data = await request.json()

    accessUserId = data["userid"]
    postid = data["postid"]
    action = data["action"]


    liked, disliked = likesdb.setInteraction(accessUserId, postid, action)

    msg = {}
    msg["currentUser"] = {
        "userid" : accessUserId,
        "liked" : bool(liked),
        "disliked" : bool(disliked)
    }

    post = postsdb.getPost(postid)
    msg["post"] = {
        "postid" : postid,
        "likes"  : post["likes"],
        "dislikes" : post["dislikes"]
    }

    msg = json.dumps(msg)
    return web.Response(text=msg, content_type="application/json")


async def getPosts(request):
    data = await request.json()
    data = dict(data)


    accessUserId = data["userid"]
    postedBy = data["postUser"]
    postCount = data["count"]

    posts =  postsdb.getAllPosts()[:postCount]
    for i in range(len(posts)):
        postedUserProfile = userdb.getUser(posts[i]["userid"])
        if postedUserProfile:
            postedUserProfile.pop("meta")
            postedUserProfile.pop("sessionid")

        posts[i]["user"] = postedUserProfile

        accessUserProfile = {}
        accessUserProfile["userid"] = accessUserId

        userPostInteraction = likesdb.getInteraction(posts[i]["postid"], accessUserId)
        if accessUserId == "-1" or not userPostInteraction:
            accessUserProfile["postLiked"] = False
            accessUserProfile["postDisliked"] = False
        else:
            accessUserProfile["postLiked"] = userPostInteraction["liked"]
            accessUserProfile["postDisliked"] = userPostInteraction["disliked"]

        posts[i]["currentUser"] = accessUserProfile


    posts = json.dumps(posts)
    return web.Response(text=posts, content_type="application/json")



app = web.Application()
app.add_routes([
    # ADMIN
    web.get('/', index),
    web.post('/', ooo),



    # USER
    web.post('/getPosts', getPosts),
    web.post('/updateLikes', updateLikes),

    web.post("/register", register),
    web.post("/login", login),

    web.post('/updateUser', updateUser),
    web.post('/post', createPost)
])

if __name__ == '__main__':
    web.run_app(app,host="localhost", port=9999)
