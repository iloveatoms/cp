import sqlite3
import json
import os

class Users:
    def __init__(self, dbPath: str):
        self.dbPath = dbPath

        if os.path.isfile(self.dbPath):
            self.conn = sqlite3.connect(self.dbPath)
        else:

            cl

    def _close(self):
        self.conn.close()

    def _execute(self, command: str):
        """Executes an SQL command and returns the result"""
        cur = self.conn.cursor()
        return cur.execute(command)

    # ---------- Create ----------
    def createUser(
        self,
        userid: int,
        name: str,
        email: str = '',
        phone: str = '',
        aadhar: str = '',
        age: int = None,
        followers: str = '',
        following: str = '',
        credits: int = 0,
        dateOfCreation: str = '',
        profileUrl: str = '',
        bio: str = '',
        meta: dict | str = None,
        sessionid: str = ''
    ):
        if isinstance(meta, dict):
            meta = json.dumps(meta)

        cur = self.conn.cursor()
        cur.execute(
            """
            INSERT INTO user
            (userid, name, email, phone, aadhar, age, followers, following, credits, dateOfCreation, profileUrl, bio, meta, sessionid)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                userid, name, email, phone, aadhar, age,
                followers, following, credits, dateOfCreation,
                profileUrl, bio, meta, sessionid
            )
        )
        cur.close()
        self.conn.commit()

    # ---------- Get ----------
    def getUser(self, userid: int) -> dict | None:
        cur = self.conn.cursor()
        cur.execute("SELECT * FROM user WHERE userid = ?", (userid,))
        row = cur.fetchone()
        cur.close()

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
    def getValue(self, userid: int, column: str):
        cur = self.conn.cursor()
        cur.execute(f"SELECT {column} FROM user WHERE userid = ?", (userid,))
        value = cur.fetchone()
        cur.close()
        return value[0] if value else None

    # ---------- Generic Column Set ----------
    def setValue(self, userid: int, column: str, value):
        if column == "meta" and isinstance(value, dict):
            value = json.dumps(value)

        cur = self.conn.cursor()
        cur.execute(
            f"UPDATE user SET {column} = ? WHERE userid = ?",
            (value, userid)
        )
        cur.close()
        self.conn.commit()

    # ---------- Individual Setters ----------
    def setName(self, userid: int, name: str):
        self.setValue(userid, "name", name)

    def setEmail(self, userid: int, email: str):
        self.setValue(userid, "email", email)

    def setPhone(self, userid: int, phone: str):
        self.setValue(userid, "phone", phone)

    def setAadhar(self, userid: int, aadhar: str):
        self.setValue(userid, "aadhar", aadhar)

    def setAge(self, userid: int, age: int):
        self.setValue(userid, "age", age)

    def setProfileUrl(self, userid: int, profileUrl: str):
        self.setValue(userid, "profileUrl", profileUrl)

    def setBio(self, userid: int, bio: str):
        self.setValue(userid, "bio", bio)

    def setSessionId(self, userid: int, sessionid: str):
        self.setValue(userid, "sessionid", sessionid)

    def addFollower(self, userid: int, followerId: int):
        followers = self.getValue(userid, "followers") or ''
        self.setValue(userid, "followers", f'{followers};{followerId}')

        following = self.getValue(followerId, "following") or ''
        self.setValue(followerId, "following", f'{following};{userid}')

    def removeFollower(self, userid: int, followerId: int):
        followers = self.getValue(userid, "followers") or ''
        if followers:
            followers = followers.split(';')
            followers.remove(str(followerId))
            followers = ";".join(followers)

            self.setValue(userid, "followers", followers)

        following = self.getValue(followerId, "following") or ''
        if following:
            following = following.split(';')
            following.remove(str(userid))
            following = ";".join(following)

            self.setValue(followerId, "following", following)

    def setCredits(self, userid: int, credits: int):
        self.setValue(userid, "credits", credits)

    def addCredits(self, userid: int, amount: int):
        current = self.getValue(userid, "credits") or 0
        self.setCredits(userid, current + amount)

    def setMeta(self, userid: int, meta: dict):
        self.setValue(userid, "meta", meta)

    # ---------- Delete ----------
    def deleteUser(self, userid: int):
        cur = self.conn.cursor()
        cur.execute("DELETE FROM user WHERE userid = ?", (userid,))
        self.conn.commit()
        cur.close()

    # ---------- List ----------
    def getAllUsers(self) -> list[dict]:
        cur = self.conn.cursor()
        cur.execute("SELECT * FROM user")
        rows = cur.fetchall()
        cur.close()

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

class Posts:
    def __init__(self, dbPath: str):
        self.dbPath = dbPath

        if os.path.isfile(self.dbPath):
            self.conn = sqlite3.connect(self.dbPath)
        else:
            raise FileNotFoundError(f'{self.dbPath} does not exist.')

    def _close(self):
        self.conn.close()

    def _execute(self, command: str):
        """Executes an SQL command and returns the result"""
        cur = self.conn.cursor()
        return cur.execute(command)

    # ---------- Create ----------
    def createPost(
        self,
        postid: str,
        userid: int,
        dataOfCreation: str,
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

        cur = self.conn.cursor()
        cur.execute(
            """
            INSERT INTO post
            (postid, userid, dataOfCreation, title, text, imageUrl, meta, likes, dislikes, credits)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                postid, userid, dataOfCreation, title, text, imageUrl,
                meta, likes, dislikes, credits
            )
        )
        cur.close()
        self.conn.commit()

    # ---------- Get ----------
    def getPost(self, postid: str) -> dict | None:
        cur = self.conn.cursor()
        cur.execute("SELECT * FROM post WHERE postid = ?", (postid,))
        row = cur.fetchone()
        cur.close()

        if not row:
            return None

        return {
            "postid": row[0],
            "userid": row[1],
            "dataOfCreation": row[2],
            "title": row[3],
            "text": row[4],
            "imageUrl": row[5],
            "meta": json.loads(row[6]) if row[6] else None,
            "likes": row[7],
            "dislikes": row[8],
            "credits": row[9]
        }

    # ---------- Generic Column Get ----------
    def getValue(self, postid: str, column: str):
        cur = self.conn.cursor()
        cur.execute(f"SELECT {column} FROM post WHERE postid = ?", (postid,))
        value = cur.fetchone()
        cur.close()
        return value[0] if value else None

    # ---------- Generic Column Set ----------
    def setValue(self, postid: str, column: str, value):
        if column == "meta" and isinstance(value, dict):
            value = json.dumps(value)

        cur = self.conn.cursor()
        cur.execute(
            f"UPDATE post SET {column} = ? WHERE postid = ?",
            (value, postid)
        )
        cur.close()
        self.conn.commit()

    # ---------- Individual Setters ----------
    def setTitle(self, postid: str, title: str):
        self.setValue(postid, "title", title)

    def setText(self, postid: str, text: str):
        self.setValue(postid, "text", text)

    def setImageUrl(self, postid: str, imageUrl: str):
        self.setValue(postid, "imageUrl", imageUrl)

    def setMeta(self, postid: str, meta: dict):
        self.setValue(postid, "meta", meta)

    def setLikes(self, postid: str, likes: int):
        self.setValue(postid, "likes", likes)

    def setDislikes(self, postid: str, dislikes: int):
        self.setValue(postid, "dislikes", dislikes)

    def setCredits(self, postid: str, credits: int):
        self.setValue(postid, "credits", credits)

    def addLikes(self, postid: str, count: int = 1):
        current = self.getValue(postid, "likes") or 0
        self.setLikes(postid, current + count)

    def addDislikes(self, postid: str, count: int = 1):
        current = self.getValue(postid, "dislikes") or 0
        self.setDislikes(postid, current + count)

    def addCredits(self, postid: str, amount: int):
        current = self.getValue(postid, "credits") or 0
        self.setCredits(postid, current + amount)

    # ---------- Delete ----------
    def deletePost(self, postid: str):
        cur = self.conn.cursor()
        cur.execute("DELETE FROM post WHERE postid = ?", (postid,))
        self.conn.commit()
        cur.close()

    # ---------- List ----------
    def getAllPosts(self, userid: int = None) -> list[dict]:
        cur = self.conn.cursor()
        query = "SELECT * FROM post"
        params = ()

        if userid:
            query += " WHERE userid = ?"
            params = (userid,)

        cur.execute(query, params)
        rows = cur.fetchall()
        cur.close()

        return [
            {
                "postid": r[0],
                "userid": r[1],
                "dataOfCreation": r[2],
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
