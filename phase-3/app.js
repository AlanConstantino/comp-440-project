// REMEMBER: Prevent SQL attacks (i.e. sanitize input from user)
// We prevent SQL injection by using the '?' symbol in SQL statements
// https://github.com/mysqljs/mysql#escaping-query-values

const runner = require('run-my-sql-file'); // allows us to run sql files
const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const bodyParser = require('body-parser'); // parses body of http request
const INITIALIZE_DATA_FILE = 'schema-and-data.sql';
const mysql = require('mysql');
const database = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    port: '3306',
    database: 'comp440'
});

database.connect((error) => {
    if (error) {
        return console.error('ERROR: ' + error.message)
    }

    console.log('Connection to MySQL server successful.');
});

// for parsing body of requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/pages', express.static(path.join(__dirname, "pages")));

const db = {
    // get user info based on their id
    getUser: (uid) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT idUser, username, firstName, lastName, email FROM user WHERE user.idUser = ?';
            database.query(sql, uid, (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(data);
            });
        });
    },
    // get the user id of the person who just commented based on their username
    getIdOfUsername: (username) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT idUser FROM user WHERE username = ?';
            database.query(sql, username, (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(data);
            });
        });
    },
    login: (username, password) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM user WHERE username = ?';
            database.query(sql, username, (error, data) => {
                if (error) {
                    reject(error)
                    return;
                }
        
                const userFound = data.length > 0;
                if (!userFound) {
                    reject({error: 'Username does not exist.'});
                    return;
                }
        
                // parsing user data to JSON object
                const parsedUserData = Object.values(JSON.parse(JSON.stringify(data)))[0];
                const passwordsMatch = parsedUserData.password === password;
                if (!passwordsMatch) {
                    reject({error: 'Passwords do not match.'});
                    return;
                }

                resolve(data);
            });
        });
    },
    // returns a list of ids of users who are not on the passed in
    // list of given ids
    // ids: array of id integers
    // i.e. [1, 2, 3, ...]
    getIdsOfUsersNotOnList: (idList) => {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT DISTINCT idUser from user WHERE ';
            const condition = 'idUser != ?';
            // add the 'AND' string to the sql query as many times as
            // the idList.length - 1
            idList.forEach((id, i) => {
                sql += condition;
                if (i !== idList.length - 1) {
                    sql += ' AND '; 
                }
            });

            database.query(sql, idList, (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(data);
            });
        });
    },
    // general purpose sql handler
    // sql: string of the sql query
    // values: array of values to go along with the sql statement
    perform: (sql, values) => {
        return new Promise((resolve, reject) => {
            database.query(sql, values, (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(data);
            });
        });
    }
};

// index page (i.e. login page)
app.get(['/', '/login'], (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/index.html'));
});

// welcome page
app.get('/welcome', async (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/welcome.html'))
});

// register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/register.html'));
});

// register page
app.get('/create-post', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/create-post.html'));
});

// create a comment page
app.get('/create-comment/:idBlog', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/create-comment.html'));
});

app.get('/list-users-different-tags', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/list-users-different-tags.html'));
});

app.get('/list-date', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/list-date.html'));
});

app.get('/positive-comments-particular-user', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/positive-comments-particular-user.html'));
});

app.get('/follow-filter', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/follow-filter.html'));
});

app.get('/blogs-with-positive-comments/:idUser', async (req, res) => {
    try {
        if (!req.params.idUser) {
            res.status(400).send({status: 'error', error: 'No parameter idBlog passed in.'});
            return;
        }

        // get all ids of blogs posted by the user
        const sql = 'SELECT idBlog FROM blog WHERE idUser = ?';
        const values = [req.params.idUser];
        const data1 = await db.perform(sql, values);
        if (data1.length === 0) {
            res.status(200).send({status: 'error', data: 'User has not posted a blog yet.'});
            return;
        }

        const blogIds = data1.map((item) => item.idBlog);
        const set = new Set([]);

        for (let i = 0; i < blogIds.length; i++) {
            const sql = 'SELECT idBlog, idComment FROM comment WHERE sentiment = 1 AND idBlog = ?';
            const data = await db.perform(sql, blogIds[i]);
            data.forEach((item) => set.add(item.idBlog));
        }

        const positiveCommentedBlogIds = [...set];

        const data = [];
        // iterate through the set of positive commented blog ids and fetch their blog data
        for (let i = 0; i < positiveCommentedBlogIds.length; i++) {
            const sql = 'SELECT subject, description, date FROM blog WHERE idBlog = ?';
            const values = [positiveCommentedBlogIds[i]];
            const response = await db.perform(sql, values);
            data.push(response[0]);
        }

        res.status(200).send({status: 'success', data});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

app.get('/common-hobby', async (req, res) => {
    try {
        const sql = 'SELECT username, hobby FROM user ORDER BY hobby';
        const response = await db.perform(sql);
        // hiking, swimming, calligraphy, bowling, movie, cooking, and dancing.
        const hobbies = {};

        // getting all hobbies of users and putting them into a key-value dictionary
        response.forEach((element) => {
            if (element.hobby in hobbies) {
                hobbies[element.hobby].push(element.username);
                return;
            }

            hobbies[element.hobby] = [];
            hobbies[element.hobby].push(element.username);
        });

        // filtering old dictionary to a new dictionary which
        // contains users who share hobbies
        const data = {};
        for (const key in hobbies) {
            if (hobbies[key].length > 1) {
                data[key] = hobbies[key];
            }
        }
        res.status(200).send({status: 'success', data});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

// returns all the ids and usernames of people who have never posted/blogged
app.get('/never-blog', async (req, res) => {
    try {
        // ids is an array of objects that contain the property idUser
        // i.e. [{idUser: ?}, {idUser: ?}, ...]
        const sql = 'SELECT DISTINCT idUser from blog';
        const postersData = await db.perform(sql);
        const idsOfPosters = postersData.map((element) => element.idUser);

        const idsData = await db.getIdsOfUsersNotOnList(idsOfPosters);
        const ids = idsData.map((element) => element.idUser);

        const data = [];
        for (let i = 0; i < ids.length; i++) {
            const user = await db.getUser(ids[i]);
            data.push({id: user[0].idUser, username: user[0].username});
        }

        res.status(200).send({status: 'success', data});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

// returns all the ids and usernames of people who have never commented
app.get('/never-comment', async (req, res) => {
    try {
        // getting ids of people who have commented
        const sql = 'SELECT DISTINCT idUser from comment';
        const idsOfCommentorsRawData = await db.perform(sql);
        const idsOfCommentors = idsOfCommentorsRawData.map((element) => element.idUser);

        // getting ids of people who have not commented based on previous list
        const idsOfUsersWhoNeverCommentedRawData = await db.getIdsOfUsersNotOnList(idsOfCommentors);
        const idsOfUsersWhoNeverCommented = idsOfUsersWhoNeverCommentedRawData.map((element) => element.idUser);

        const data = [];
        for (let i = 0; i < idsOfUsersWhoNeverCommented.length; i++) {
            const user = await db.getUser(idsOfUsersWhoNeverCommented[i]);
            data.push({id: user[0].idUser, username: user[0].username});
        }

        res.status(200).send({status: 'success', data});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

app.get('/users-with-positive-comments', async (req, res) => {
    try {
        // get idBlog's of all positive and negative comments
        const idOfBlogSentiment0 = 'SELECT DISTINCT idBlog FROM comment WHERE sentiment = 0';
        const idOfBlogSentiment1 = 'SELECT DISTINCT idBlog FROM comment WHERE sentiment = 1';
        const idBlogOfNegativeComments = await db.perform(idOfBlogSentiment0);
        const idBlogOfPositiveComments = await db.perform(idOfBlogSentiment1);

        // converting array of object into a simple array containing ids
        const positive = idBlogOfPositiveComments.map((element) => element.idBlog);
        const negative = idBlogOfNegativeComments.map((element) => element.idBlog);

        const blogIds = [];

        // get the ids of blogs who only contain positive comments
        for (let i = 0; i < positive.length; i++) {
            if (!negative.includes(positive[i])) {
                blogIds.push(positive[i]);
            }
        }

        // gets the user id from a blog id and stores all the user ids
        // into an array
        const uidsRaw = [];
        const sql = 'SELECT DISTINCT idUser FROM blog WHERE idBlog = ?';
        for (let i = 0; i < blogIds.length; i++) {
            const rawData = await db.perform(sql, blogIds[i]);
            uidsRaw.push(rawData);
        }

        // gets only the ids of each object and stores it as an array
        const uids = uidsRaw.map((element) => element[0].idUser);
        
        // converting uids to usernames and inserting them into a set
        // to not have duplicate usernames
        const usernames = new Set([]);
        for (let i = 0; i < uids.length; i++) {
            const sql = 'SELECT username FROM user WHERE idUser = ?';
            const data = await db.perform(sql, uids[i]);
            usernames.add(data[0].username);
        }

        res.status(200).send({status: 'success', data: [...usernames]});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

app.get('/users-with-negative-comments', async (req, res) => {
    try {
        // get idBlog's of all positive and negative comments
        // 0 = negative
        // 1 = positive
        const sql1 = 'SELECT DISTINCT idUser FROM comment WHERE sentiment = 0';
        const userIdsRaw = await db.perform(sql1);

        // list of usernames we're going to return
        // is a set because we don't want duplicate usernames
        const usernames = new Set([]);

        // converting array of object into a simple array containing ids
        const userIds = userIdsRaw.map((element) => element.idUser);

        // get the usernames associated with the ids of the user
        const sql2 = 'SELECT username FROM user WHERE idUser = ?';
        for (let i = 0; i < userIds.length; i++) {
            const usernamesRaw = await db.perform(sql2, userIds[i]);
            usernames.add(usernamesRaw[0].username);
        }

        res.status(200).send({status: 'success', data: [...usernames]});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

// get the sentiment of the comment given the comment's id
app.get('/sentiment/:idComment', async (req, res) => {
    if (!req.params.idComment) {
        res.status(400).send({status: 'error', error: 'Error: No comment id passed as a parameter.'});
        return;
    }
    
    // positive = 1
    // negative = 0
    try {
        const sql = 'SELECT sentiment FROM comment WHERE idComment = ?';
        const rawData = await db.perform(sql, req.params.idComment);
        const value = rawData[0].sentiment;
        const data = [];
        // if value is 1, sentiment is positive
        if (value === 1) {
            data.push({sentiment: 'positive', value});
        }
        // if value is anything other than 1, sentiment is negative
        else {
            data.push({sentiment: 'negative', value});
        }
        
        res.status(200).send({status: 'success', data});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

// return the rating of the blog based on the blog's id
// app.get('/rating/:idBlog', async (req, res) => {
//     if (!req.params.idBlog) {
//         res.status(400).send({status: 'error', error: 'Error: No blog id passed as a parameter.'});
//         return;
//     }
    
//     try {
//         const sql = 'SELECT rate FROM blog WHERE idBlog = ?';
//         const data = await db.perform(req.params.idBlog);
//         res.status(200).send({status: 'success', data});
//     } catch(error) {
//         res.status(400).send({status: 'error', error});
//     }
// });

// for updating the rating column of the blog table with a specific blog id
// app.put('/rating', async (req, res) => {
//     if (!req.body.rating || !req.body.idBlog) {
//         res.status(400).send({status: 'error', error: 'Error: No new rating and/or blog id passed as a body parameter.'});
//         return;
//     }

//     try {
//         const sql = 'UPDATE blog SET rate = ? WHERE idBlog = ?';
//         const data = await db.perform(sql, [req.body.rating, req.body.idBlog]);
//         res.status(200).send({status: 'success', data});
//     } catch (error) {
//         res.status(400).send({status: 'error', error});
//     }
// });

// add the comment to the database
app.post('/insert-comment/:idBlog', async (req, res) => {
    // idBlog is the id of the post you're commenting on
    if (!req.params.idBlog || !req.body.description || !req.body.username) {
        res.status(400).send({error: 'Error: ID blog, username, or description are empty.'});
        return;
    }

    try {
        const [{idUser: idOfCommentor}] = await db.getIdOfUsername(req.body.username);

        const sql = 'SELECT idUser FROM blog WHERE idBlog = ?';
        const [{idUser: idOfPersonWhoPostedBlog}] = await db.perform(sql, req.params.idBlog);

        // if the id of both the person who is commenting and the person who wrote the blog
        // are the same, error out since a user can't comment on their own post/blog
        if (idOfCommentor === idOfPersonWhoPostedBlog) {
            res.status(400).send({status: 'error', error: `Error: User can't comment on their own post.`});
            return;
        }

        // if user has already commented more than 3 or more times, error out
        const sql2 = 'SELECT idUser, date FROM comment WHERE idUser = ? AND DATE(`date`) = CURDATE()';
        const commentTotal = (await db.perform(sql2, idOfCommentor)).length;
        // const commentTotal = dataOfCommentTotal.length;
        if (commentTotal >= 3) {
            res.status(400).send({status: 'error', error: `Error: User has already commented 3 times total for today.`});
            return;
        }

        // check to see if user has already commented on current post
        const sql3 = 'SELECT * FROM comment WHERE idBlog = ? AND idUser = ?';
        const values = [req.params.idBlog, idOfCommentor];
        const numOfCommentsPostedOnBlogByUser = (await db.perform(sql3, values)).length;
        
        if (numOfCommentsPostedOnBlogByUser >= 1) {
            res.status(400).send({status: 'error', error: `Error: User has already commented on this post.`});
            return;
        }

        // insert comment into database
        const insertSql = 'INSERT INTO comment (idUser, date, description, idBlog, sentiment) VALUES (?, CURDATE(), ?, ?, ?)';
        await db.perform(insertSql, [idOfCommentor, req.body.description, req.params.idBlog, req.body.sentiment]);
        res.status(200).send({status: 'success', data: 'Comment inserted succesfully!'});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

// returns all comments of a particular blog from its blog id
// CONVERT TO GET REQUEST
app.post('/comments/:idBlog', async (req, res) => {
    if (!req.params.idBlog) {
        res.status(400).send({error: 'Error: No ID passed in.'});
        return;
    }

    try {
        const sql = 'SELECT * FROM comment WHERE idBlog = ? ORDER BY idBlog DESC';
        const data = await db.perform(sql, req.params.idBlog);
        res.status(200).send({status: 'success', data})
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

// returns all the posts of all time
// CONVERT TO GET REQUEST
app.post('/posts', async (req, res) => {
    try {
        // get all posts from database and return them
        const sql = 'SELECT * FROM blog ORDER BY idBlog DESC';
        const data = await db.perform(sql);
        return res.status(200).send({status: 'success', data})
    } catch (e) {
        const {code, errno, sqlMessage, sql} = e;
        const error = {code, errno, sqlMessage, sql};
        return res.status(400).send({status: 'error', error});
    }
});

// return the usernames of those users who posted on a particual date as well
// as the number of posts they've made for that day
app.get('/users/:date', async (req, res) => {
    if (!req.params.date) {
        res.status(400).send({status: 'error', error: 'Error: No date passed in as a parameter.'});
        return;
    }

    try {
        // the array will contain an object as an entry
        // each object will contain the username and amount of posts that user made
        // there will be multiple objects if multiple users have posted the same amount for that day
        const users = [];
        
        // select all users who posted on a particular day
        const sql = 'SELECT idUser FROM blog WHERE date = ?';
        const data = await db.perform(sql, req.params.date);

        // check to make sure date is a passed in parameter
        if (!data.length) {
            res.status(400).send({status: 'error', data: 'No posts for chosen date exist!'});
            return;
        }
        
        // filter out the ids of each user and place them in an array
        const ids = new Set(data.map((item) => { if ('idUser' in item) return item.idUser }));

        // count the total number of posts for each id passed in
        const count = {};
        for (const id of ids) {
            const sql2 = 'SELECT COUNT(idBlog) FROM blog WHERE idUser = ? AND date = ?';
            const values2 = [id, req.params.date];
            const data2 = await db.perform(sql2, values2); 
            const numOfPosts = data2[0]['COUNT(idBlog)'];

            if (numOfPosts in count) {
                count[numOfPosts].push(id);
            } else {
                count[numOfPosts] = [id];
            }

        }

        // Get the highest key number (which represents the number of posts users made)
        // and return the array of user ids
        let highestKey = 0;
        for (key in count) {
            const intKey = parseInt(key);
            if (intKey > highestKey) {
                highestKey = intKey;
            }
        }

        // finally get the actual username based on the ids of the users
        for (userId of count[highestKey]) {
            const sql = 'SELECT username FROM user WHERE idUser = ?';
            const data = await db.perform(sql, userId);
            users.push({ username: data[0].username, posts: highestKey });
        }

        res.status(200).send({status: 'success', data: users});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

app.get('/all-tags', async (req, res) => {
    try {
        const sql = 'SELECT DISTINCT tagName FROM tag';
        const data = await db.perform(sql);

        res.status(200).send({status: 'success', data});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

// returns all the tags associated with the blog id
app.get('/tags/:idBlog', async (req, res) => {
    // check to see if idBlog is a parameter, if not error out
    if (!req.params.idBlog) {
        res.status(400).send({status: 'error', error: 'Error: No ID passed in.'});
        return;
    }

    try {
        const sql = 'SELECT * FROM tag WHERE idBlog = ?';
        const data = await db.perform(sql, req.params.idBlog);
        res.status(200).send({status: 'success', data})
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

// return the username and id of all users
app.get('/users', async (req, res) => {
    try {
        const sql = 'SELECT idUser, username from user';
        const data = await db.perform(sql);
        res.status(200).send({status: 'success', data});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

app.get('/users/:tagOne/:tagTwo', async (req, res) => {
    if (!req.params.tagOne || !req.params.tagTwo) {
        res.status(400).send({status: 'error', error: 'Tags not passed as URL parameters.'});
        return;
    }

    try {
        // object that will contain users who have posted at least 2
        // or more times along with their posts and the tags of each post
        const users = {};

        // get username and idUser of all distinct posters
        const sql = 'SELECT user.username, user.idUser FROM user INNER JOIN blog ON user.idUser = blog.idUser';
        const data = await db.perform(sql);    

        // get all users who ever posted a blog
        data.forEach((item) => {
            users[item.idUser] = {
                username: item.username,
                count: (async () => {
                    const sql = 'SELECT user.username, user.idUser FROM user INNER JOIN blog ON user.idUser = blog.idUser';
                    const data = await db.perform(sql);
                    return (data.filter((el) => el.idUser === item.idUser)).length;
                })(),
            };
        });

        // filter list for users who have posted more than twice
        const filteredList = {};
        for (let key in users) {
            const count = await users[key].count;
            if (2 <= count) {
                filteredList[key] = { count, idUser: parseInt(key), username: users[key].username };
            }
        }

        // selects the ids of blogs whose tags match that of those provided
        const sql2 = 'SELECT DISTINCT idBlog FROM tag WHERE tagName = ? OR tagName = ?';
        const values2 = [req.params.tagOne, req.params.tagTwo];
        const idsOfBlogs = await db.perform(sql2, values2);

        // iterate through the ids of the blogs and get all that match from db
        // after, make sure that the id of the user matches that of the filtered list
        const set = new Set([]);
        for (let item of idsOfBlogs) {
            const sql = 'SELECT * FROM blog WHERE idBlog = ?';
            const [data] = await db.perform(sql, item.idBlog);

            for (let key in filteredList) {
                if (data.idUser === filteredList[key].idUser) {
                    set.add(filteredList[key].username);
                }
            }
        }

        res.status(200).send({status: 'success', data: [...set]});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

// returns data about a specific user from their id
// CONVERT TO GET REQUEST
app.post('/user/:id', async (req, res) => {
    if (!req.params.id) {
        res.status(400).send({error: 'Error: No ID passed in.'});
        return;
    }

    try {
        const data = await db.getUser(req.params.id);
        res.status(200).send({status: 'success', data});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

// handling user login
app.post('/create-post', async (req, res) => {
    if (!req.body.username) {
        res.status(400).send({error: 'User is not logged in!'});
        return;
    }

    if (!req.body.subject || !req.body.description || !req.body.tags) {
        res.status(400).send({error: 'Blog fields were left empty.'});
        return;
    }

    try {
        const [{idUser}] = await db.getIdOfUsername(req.body.username);

        const sqlPostCount = "SELECT * FROM blog WHERE idUser = ? AND date = CURDATE();";
        const numOfPostsToday = (await db.perform(sqlPostCount, idUser)).length;

        // check to see if user has reached their limit of 2 daily posts
        if (numOfPostsToday >= 2) {
            res.status(400).send({status: 'error', error: 'Error: User has reached daily limit of blog creation.'});
            return;
        }

        // insert blog data into db
        const sql = 'INSERT INTO blog (idUser, subject, description, date) VALUES (?, ?, ?, CURDATE())';
        const insertPost = await db.perform(sql, [idUser, req.body.subject, req.body.description]);
        const idBlog = insertPost.insertId;
        const tags = req.body.tags;

        // insert tag data into db as long as there is one valid tag in the tags array
        if (tags.length >= 1) {
            const sql = 'INSERT INTO tag (tagName, idBlog) VALUES (?, ?)';
            for (let i = 0; i < tags.length; i++) {
                await db.perform(sql, [tags[i], idBlog]);
            }
        }

        res.status(200).send({status: 'success', data: 'Successfully inserted blog into database!'});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

// handling user login
app.post('/welcome', async (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.status(400).send({status: 'error', error: 'Username or password not passed in.'});
        return;
    }

    try {
        const data = await db.login(req.body.username, req.body.password);
        if (data) {
            res.sendFile(path.join(__dirname, 'pages/welcome.html'));
        } else {
            res.status(400).send({status: 'error', error: data});
        }
    } catch(error) {
        res.status(400).send({status: 'error', error});
    }
});

app.post('/register', async (req, res) => {
    const validRegistrationData = (data) => {
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (element === '' || element === null || element === undefined) {
                return false;
            }
        }
        return true;
    }

    const { hobby, username, password, confirmPassword, firstName, lastName, email } = req.body;
    const values = [ hobby, username, password, confirmPassword, firstName, lastName, email ];

    if (!validRegistrationData(values)) {
        res.status(400).send({status: 'error', error: 'One or more fields are empty or invalid'});
        return;
    }

    if (password === confirmPassword) {
        res.status(400).send({error: "Passwords do not match."});
        return;
    }
    
    const user = { hobby, username, password, firstName, lastName, email };

    try {
        const sql = 'INSERT INTO user SET ?';
        const data = await db.perform(sql, user);
        if (data) {
            res.sendFile(path.join(__dirname, 'pages/welcome.html'));
        } else {
            res.status(400).send({status: 'error', error: data});
        }
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

app.post('/initialize', (req, res) => {
    // sql file execution code taken from here:
    // https://www.npmjs.com/package/run-my-sql-file

    // initialize database with new schema from phase 2

    runner.connectionOptions({
        host: '127.0.0.1',
        user: 'user',
        password: '',
        port: '3306'
    });

    const sqlFile = __dirname + `/sql/${INITIALIZE_DATA_FILE}`;
    console.log(sqlFile);
    runner.runFile(sqlFile, (error) => {
        if (error) {
            res.status(400).send({error});
        }
        res.status(200).send({message: `Successfully executed the ${INITIALIZE_DATA_FILE} file!`});
    });
});

app.get('/followers/:userX/:userY', async (req, res) => {
    if (!req.params.userX || !req.params.userY) {
        res.status(400).send({status: 'error', error: 'Error: One or more parameters are missing.'});
        return;
    }

    try {
        const getId = async (username) => {
            const sql = 'SELECT idUser FROM user WHERE username = ?';
            const data = await db.perform(sql, username);
            if (!data.length) return false;
            return data[0].idUser;
        };
        const getUsername = async (id) => {
            const sql = 'SELECT username FROM user WHERE idUser = ?';
            const data = await db.perform(sql, id);
            if (!data.length) return false;
            return data[0].username;
        };
        const getFollowers = async (id) => {
            const sql = 'SELECT idFollower FROM follow WHERE idUser = ?';
            const data = await db.perform(sql, id);
            if (!data.length) return [];
            return data.map((follower) => follower.idFollower);
        };

        // ids of both userX and userY
        const idUserX = await getId(req.params.userX);
        const idUserY = await getId(req.params.userY);

        const followersOfX = await getFollowers(idUserX);
        const followersOfY = await getFollowers(idUserY);

        // if both users have no followers, then just exit
        if (!followersOfX.length && !followersOfY.length) {
            res.status(400).send({status: 'error', error: 'Both users have no followers.'});
            return;
        }

        const intersectionOfFollowers = followersOfX.filter((item) => followersOfY.includes(item));

        if (!intersectionOfFollowers.length) {
            res.status(400).send({status: 'error', error: "Users don't share followers or don't have followers."});
            return;
        }

        // finally iterate over all user ids and query db for their usernames
        const followers = [];  
        for (let i = 0; i < intersectionOfFollowers.length; i++) {
            followers.push(await getUsername(intersectionOfFollowers[i]));
        }
        
        res.status(200).send({status: 'success', data: followers});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

// follows a particular user
app.post('/follow', async (req, res) => {
    if (!req.body.idToFollow || !req.body.username) {
        res.status(400).send({status: 'error', error: 'Error: One or more body contents are missing.'});
        return;
    }

    const { idToFollow, username } = req.body;

    try {
        // get the user id of the person's username
        const sqlGetId = 'SELECT idUser FROM user WHERE username = ?';
        const [{idUser: idOfFollower}] = await db.perform(sqlGetId, username);

        // check to make sure user isn't already following the person they're trying to follow
        const sqlCheck = "SELECT CASE WHEN EXISTS (SELECT * FROM follow WHERE idUser = ? AND idFollower = ?) THEN 'TRUE' ELSE 'FALSE' END";
        const sqlCheckValues = [idToFollow, idOfFollower];
        const [sqlCheckData] = await db.perform(sqlCheck, sqlCheckValues);
        const isAlreadyFollowing = sqlCheckData[Object.keys(sqlCheckData)[0]] === 'TRUE' ? true : false;
        
        // if user is already following person then exit
        if (isAlreadyFollowing) {
            res.status(400).send({status: 'success', data: 'Already following user.'});
            return;
        }
    
        // Insert the user into database (i.e. follow the user)
        const sql = 'INSERT INTO follow (idUser, idFollower) VALUES (?, ?)';
        const values = [idToFollow, idOfFollower];
        await db.perform(sql, values);

        res.status(200).send({status: 'success', data: 'Successfully followed user!'});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
    // res.status(200).send({status: 'inside of /fetch'});
});

app.get('/is-following/:idToFollow/:idOfFollower', async (req, res) => {
    const getId = async (username) => {
        const sql = 'SELECT idUser FROM user WHERE username = ?';
        const data = await db.perform(sql, username);
        if (!data.length) return false;
        return data[0].idUser;
    };


    if (!req.params.idOfFollower || !req.params.idToFollow) {
        res.status(400).send({status: 'error', error: 'Error: Missing url parameters.'});
        return;
    }

    try {
        let idOfFollower;
        let idToFollow;
        
        // check to see if idOfFollower is a NaN when converted to an int
        // if it's NaN, then you know you have a username, else it's an id
        if (isNaN(parseInt(req.params.idOfFollower))) {
            idOfFollower = await getId(req.params.idOfFollower);
            
            // if you have a username, then get their id
            if (idOfFollower === false) {
                res.status(400).send({status: 'error', error: `User by the username of '${req.params.idOfFollower}' doesn't exist.`});
                return;
            }
        } else {
            idOfFollower = parseInt(req.params.idOfFollower);
        }

        // check to see if :idToFollow is a valid number when parsed
        if (isNaN(parseInt(req.params.idToFollow))) {
            idToFollow = await getId(req.params.idToFollow);
            
            if (idToFollow === false) {
                res.status(400).send({status: 'error', error: `User by the username of '${req.params.idToFollow}' doesn't exist.`});
                return;
            }
        } else {
            // if valid number then just store it in idToFollow
            idToFollow = parseInt(req.params.idToFollow);
        }

        // have to check if idOfFollower already follows idToFollow
        const sql = 'SELECT * FROM follow WHERE idUser = ? AND idFollower = ?';
        const values = [idToFollow, idOfFollower];
        const data = await db.perform(sql, values);

        if (!data.length) {
            res.status(200).send({status: 'success', data: false});
            return;
        }
        
        res.status(200).send({status: 'success', data: true});
    } catch (error) {
        res.status(200).send({status: 'error', error});
    }
});

// unfollows a particular user
app.delete('/unfollow', async (req, res) => {
    if (!req.body.idToUnfollow || !req.body.username) {
        res.status(400).send({status: 'error', error: 'Error: One or more body contents are missing.'});
        return;
    }

    const { idToUnfollow, username } = req.body;

    try {
        // get the user id of the person's username
        const sqlGetId = 'SELECT idUser FROM user WHERE username = ?';
        const [{idUser: idOfFollower}] = await db.perform(sqlGetId, username);

        // Delete follow from database (i.e. unfollow user)
        const sql = 'DELETE FROM follow WHERE idUser = ? AND idFollower = ?';
        const values = [idToUnfollow, idOfFollower];
        await db.perform(sql, values);

        res.status(200).send({status: 'success', data: 'Successfully unfollowed user!'});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

// implement a request that lists the users who are followed by both X and Y usernames

app.post('/logout', (req, res) => {
    database.end();
})

app.listen(port, () => {
    console.log(`Server started on port ${port}.\nGo to localhost:${port} to view webpage.`)
});