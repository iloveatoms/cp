import aiosqlite as sqlite3
import json
import os
import bcrypt


# ---------- Password Helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


class Connection:
    def __init__(self, dbPath: str):
        self.dbPath = dbPath
        self._conn = None

    async def initConnection(self):
        self._conn = await sqlite3.connect(self.dbPath)
        return True

    async def _close(self):
        await self._conn.close()

    async def cursor(self):
        return await self._conn.cursor()

    async def commit(self):
        await self._conn.commit()



class User(Connection):
    def __init__(self, dbPath):
        super().__init__(dbPath)

    # ---------- AUTH ----------
    async def verifyPassword(self, userid: int, password: str) -> bool:
        meta = await self.getValue(userid, "meta")
        if not meta:
            return False

        try:
            meta = json.loads(meta)
            hashed = meta.get("password")

            if not hashed:
                return False
            return verify_password(password, hashed)
        except Exception:
            return False

    # ---------- Create ----------
    async def createUser(
        self,
        userid: int,
        name: str,
        email: str = '',
        phone: str = '',
        aadhar: int = 0,
        age: int = 0,
        followers: int = 0,
        following: int = 0,
        credits: int = 0,
        dateOfCreation: int = 0,
        profileUrl: str = '',
        bio: str = '',
        meta: dict | str = None,
        sessionid: str = ''
    ):
        if isinstance(meta, dict):
            meta = json.dumps(meta)

        cur = await self.cursor()
        await cur.execute(
            """
            INSERT INTO user
            (userid, name, email, phone, aadhar, age, followers, following,
             credits, dateOfCreation, profileUrl, bio, meta, sessionid)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                userid, name, email, phone, aadhar, age,
                followers, following, credits, dateOfCreation,
                profileUrl, bio, meta, sessionid
            )
        )
        await cur.close()
        await self.commit()

    # ---------- Get ----------
    async def getUser(self, userid: int) -> dict | None:
        cur = await self.cursor()
        await cur.execute("SELECT * FROM user WHERE userid = ?", (userid,))
        row = await cur.fetchone()
        await cur.close()

        if not row:
            return None

        return {
            "userid": row[0],
            "name": row[1],
            "email": row[2],
            "phone": row[3],
            "aadhar": row[4],
            "age": row[5],
            "followers": row[6],
            "following": row[7],
            "credits": row[8],
            "dateOfCreation": row[9],
            "profileUrl": row[10],
            "bio": row[11],
            "meta": json.loads(row[12]) if row[12] else None,
            "sessionid": row[13]
        }

    # ---------- Generic Column Get ----------
    async def getValue(self, userid: int, column: str):
        cur = await self._conn.cursor()
        await cur.execute(f"SELECT {column} FROM user WHERE userid = ?", (userid,))
        value = await cur.fetchone()
        await cur.close()

        return value[0] if value else None

    # ---------- Generic Column Set ----------
    async def setValue(self, userid: int, column: str, value):
        if column == "meta" and isinstance(value, dict):
            value = json.dumps(value)

        cur = await self.cursor()
        await cur.execute(
            f"UPDATE user SET {column} = ? WHERE userid = ?",
            (value, userid)
        )
        await cur.close()
        await self.commit()

    # ---------- Delete ----------
    async def deleteUser(self, userid: int):
        cur = await self.cursor()
        await cur.execute("DELETE FROM user WHERE userid = ?", (userid,))
        await cur.close()
        await self.commit()

    # ---------- List ----------
    async def getAllUsers(self) -> list[dict]:
        cur = await self.cursor()
        await cur.execute("SELECT * FROM user")
        rows = await cur.fetchall()
        await cur.close()

        return [
            {
                "userid": r[0],
                "name": r[1],
                "email": r[2],
                "phone": r[3],
                "aadhar": r[4],
                "age": r[5],
                "followers": r[6],
                "following": r[7],
                "credits": r[8],
                "dateOfCreation": r[9],
                "profileUrl": r[10],
                "bio": r[11],
                "meta": json.loads(r[12]) if r[12] else None,
                "sessionid": r[13]
            }
            for r in rows
        ]


    # ---------- Individual Setters ----------
    async def setName(self, userid: int, name: str):
        await self.setValue(userid, "name", name)

    async def setEmail(self, userid: int, email: str):
        await self.setValue(userid, "email", email)

    async def setPhone(self, userid: int, phone: str):
        await self.setValue(userid, "phone", phone)

    async def setAadhar(self, userid: int, aadhar: int):
        await self.setValue(userid, "aadhar", aadhar)

    async def setAge(self, userid: int, age: int):
        await self.setValue(userid, "age", age)

    async def setProfileUrl(self, userid: int, profileUrl: str):
        await self.setValue(userid, "profileUrl", profileUrl)

    async def setBio(self, userid: int, bio: str):
        await self.setValue(userid, "bio", bio)

    async def setSessionId(self, userid: int, sessionid: str):
        await self.setValue(userid, "sessionid", sessionid)


    # TODO: USE SQL RELATIONS followers<-->user
    # async def addFollower(self, userid: int, followerId: int)
    # async def removeFollower(self, userid: int, followerId: int)


    # TODO: auto calculate from posts
    async def setCredits(self, userid: int, credits: int):
        await self.setValue(userid, "credits", credits)

    async def addCredits(self, userid: int, amount: int):
        current = await self.getValue(userid, "credits") or 0
        await self.setCredits(userid, current + amount)

    async def setMeta(self, userid: int, meta: dict):
        await self.setValue(userid, "meta", meta)

    # ---------- Delete ----------
    async def deleteUser(self, userid: int):
        cur = await self.cursor()
        await cur.execute("DELETE FROM user WHERE userid = ?", (userid,))
        await cur.close()

    # ---------- List ----------
    async def getAllUsers(self) -> list[dict]:
        cur = await self.cursor()
        await cur.execute("SELECT * FROM user")
        rows = await cur.fetchall()
        await cur.close()

        return [
            {
                "userid": r[0],
                "name": r[1],
                "email": r[2],
                "phone": r[3],
                "aadhar": r[4],
                "age": r[5],
                "followers": r[6],
                "following": r[7],
                "credits": r[8],
                "dateOfCreation": r[9],
                "profileUrl": r[10],
                "bio": r[11],
                "meta": json.loads(r[12]) if r[12] else None,
                "sessionid": r[13]
            }
            for r in rows
        ]

class Post(Connection):
    def __init__(self, dbPath):
        super().__init__(dbPath)

    # ---------- Create ----------
    async def createPost(
        self,
        postid: int,
        userid: int,
        dateOfCreation: int,
        title: str = '',
        text: str = '',
        imageUrl: str = '',
        meta: dict | str = None,
        likes: int = 0,
        dislikes: int = 0,
        credits: int = 0
    ):
        if isinstance(meta, dict):
            meta = json.dumps(meta)

        cur = await self._conn.cursor()
        await cur.execute(
            """
            INSERT INTO post
            (postid, userid, dateOfCreation, title, text, imageUrl, meta, likes, dislikes, credits)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                postid, userid, dateOfCreation, title, text, imageUrl,
                meta, likes, dislikes, credits
            )
        )
        await cur.close()
        await self.commit()

    # ---------- Get ----------
    async def getPost(self, postid: int) -> dict | None:
        cur = await self._conn.cursor()
        await cur.execute("SELECT * FROM post WHERE postid = ?", (postid,))
        row = await cur.fetchone()
        await cur.close()

        if not row:
            return None

        return {
            "postid": row[0],
            "userid": row[1],
            "dateOfCreation": row[2],
            "title": row[3],
            "text": row[4],
            "imageUrl": row[5],
            "meta": json.loads(row[6]) if row[6] else None,
            "likes": row[7],
            "dislikes": row[8],
            "credits": row[9]
        }

    # ---------- Generic Column Get ----------
    async def getValue(self, postid: int, column: str):
        cur = await self._conn.cursor()
        await cur.execute(f"SELECT {column} FROM post WHERE postid = ?", (postid,))
        value = await cur.fetchone()
        await cur.close()
        return value[0] if value else None

    # ---------- Generic Column Set ----------
    async def setValue(self, postid: int, column: str, value):
        if column == "meta" and isinstance(value, dict):
            value = json.dumps(value)

        cur = await self._conn.cursor()
        await cur.execute(
            f"UPDATE post SET {column} = ? WHERE postid = ?",
            (value, postid)
        )
        await cur.close()
        await self.commit()

    # ---------- Individual Setters ----------
    async def setTitle(self, postid: int, title: str):
        await self.setValue(postid, "title", title)

    async def setText(self, postid: int, text: str):
        await self.setValue(postid, "text", text)

    async def setImageUrl(self, postid: int, imageUrl: str):
        await self.setValue(postid, "imageUrl", imageUrl)

    async def setMeta(self, postid: int, meta: dict):
        await self.setValue(postid, "meta", meta)

    async def setLikes(self, postid: int, likes: int):
        await self.setValue(postid, "likes", likes)

    async def setDislikes(self, postid: int, dislikes: int):
        await self.setValue(postid, "dislikes", dislikes)

    async def setCredits(self, postid: int, credits: int):
        await self.setValue(postid, "credits", credits)

    async def addLikes(self, postid: int, count: int = 1):
        current = await self.getValue(postid, "likes") or 0
        await self.setLikes(postid, current + count)

    async def addDislikes(self, postid: int, count: int = 1):
        current = await self.getValue(postid, "dislikes") or 0
        await self.setDislikes(postid, current + count)

    #TODO: autoclaculate
    # async def addCredits(self, postid: int, amount: int):
    #     current = await self.getValue(postid, "credits") or 0
    #     await self.setCredits(postid, current + amount)

    # ---------- Delete ----------
    async def deletePost(self, postid: int):
        cur = await self.cursor()
        await cur.execute("DELETE FROM post WHERE postid = ?", (postid,))
        await cur.close()
        await self.commit()

    # ---------- List ----------
    async def getAllPosts(self, userid: int = None) -> list[dict]:
        cur = await self.cursor()
        query = "SELECT * FROM post"
        params = ()

        if userid:
            query += " WHERE userid = ?"
            params = (userid,)


        await cur.execute(query, params)
        rows = await cur.fetchall()
        await cur.close()

        return [
            {
                "postid": r[0],
                "userid": r[1],
                "dateOfCreation": r[2],
                "title": r[3],
                "text": r[4],
                "imageUrl": r[5],
                "meta": json.loads(r[6]) if r[6] else None,
                "likes": r[7],
                "dislikes": r[8],
                "credits": r[9]
            }
            for r in rows
        ]


class Likes(Connection):
    def __init__(self, dbPath):
        super().__init__(dbPath)

    # ---------- Setters ----------
    async def setInteraction(self, userid: int, postid: int, action: str) -> (int, int):
        """
        action: 'liked', 'disliked', or 'neutral'
        Counters are handled by triggers
        """
        liked = 1 if action == "liked" else 0
        disliked = 1 if action == "disliked" else 0
        if action == "neutral":
            await self._conn.execute(
                "DELETE FROM likes WHERE userid = ? AND postid = ?",
                (userid, postid)
            )
        else:
            await self._conn.execute(
                """
                INSERT INTO likes (userid, postid, liked, disliked)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(userid, postid)
                DO UPDATE SET liked = excluded.liked,
                              disliked = excluded.disliked
                """,
                (userid, postid, liked, disliked)
            )

        await self.commit()
        return (liked, disliked)

    # ---------- Getters (Posts) ----------
    async def getInteraction(self, userid: int, postid: int):
        cur = await self._conn.execute(
            "SELECT * FROM likes WHERE postid = ? AND userid = ?",
            (postid, userid)
        )
        row = await cur.fetchone()
        await cur.close()

        if not row:
            return None

        return {
            "userid"   : row[0],
            "postid"   : row[1],
            "liked"    : bool(row[2]),
            "disliked" : bool(row[3])
            }

    async def getLikesOfPost(self, postid: int) -> list[int]:
        cur = await self._conn.execute(
            "SELECT userid FROM likes WHERE postid = ? AND liked = 1",
            (postid,)
        )
        return [r[0] for r in await cur.fetchall()]

    async def getDislikesOfPost(self, postid: int) -> list[int]:
        cur = await self._conn.execute(
            "SELECT userid FROM likes WHERE postid = ? AND disliked = 1",
            (postid,)
        )
        return [r[0] for r in await cur.fetchall()]

    # ---------- Getters (Users) ----------
    async def getLikedPostsByUser(self, userid: int) -> list[str]:
        cur = await self._conn.execute(
            "SELECT postid FROM likes WHERE userid = ? AND liked = 1",
            (userid,)
        )
        return [r[0] for r in await cur.fetchall()]

    async def getDislikedPostsByUser(self, userid: int) -> list[str]:
        cur = await self._conn.execute(
            "SELECT postid FROM likes WHERE userid = ? AND disliked = 1",
            (userid,)
        )
        return [r[0] for r in await cur.fetchall()]

    # ---------- Stats ----------
    async def getPostStats(self, postid: int) -> dict:
        cur = await self._conn.execute(
            "SELECT SUM(liked), SUM(disliked) FROM likes WHERE postid = ?",
            (postid,)
        )
        res = await cur.fetchone()
        return {
            "likes": res[0] or 0,
            "dislikes": res[1] or 0
        }
