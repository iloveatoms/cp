from aiohttp import web
import json
import database
from pprint import pprint as pp


userdb = database.Users('../databases/users.db')
postsdb = database.Posts('../databases/users.db')
likesdb = database.Likes('../databases/users.db')

async def index(request):
    return web.Response(
        text="<h1 style='text-align:center;font-size:50px;font-family:sans-serif'>Hello API</h1>",
        content_type='text/html'
        )

async def createUser(request):
    data = await request.json()  # Extract POST data
    data = dict(data)

    if userdb.getUser(data["userid"])==None:
        userdb.createUser(**data)
        msg = {"user":"created"}
    else:
        msg = {"user":"exists"}
        if data["meta"]["password"] in userdb.getValue(data["userid"], "meta"):
            msg["authenticated"] = "true"
        else:
            msg["authenticated"] = "false"

    msg = json.dumps(msg)
    return web.Response(text=msg, content_type="application/json")


async def updateUser(request):
    data = dict(await request.json())
    userid = data.get("userid", None)
    if not userid:
        return web.Response(status=301, text="No Operation", content_type="text/html")

    for key in data:
        userdb.setValue()

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


async def ooo(request):
    data = await request.json()
    data = dict(data)

    return web.Response(text=json.dumps(data), content_type="application/json")

app = web.Application()
app.add_routes([
    web.get('/', index),
    web.post('/getPosts', getPosts),
    web.post('/updateLikes', updateLikes),

    web.post('/', ooo),
    web.post('/createUser', createUser),
    web.post('/updateUser', updateUser),
    web.post('/post', createPost)
])

if __name__ == '__main__':
    web.run_app(app,host="localhost", port=9999)
