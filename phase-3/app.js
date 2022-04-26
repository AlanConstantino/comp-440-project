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
    user: 'user',
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
            // const sql = 'SELECT * FROM user WHERE user.idUser = ?';
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
    getIdsOfUsersNotOnList: (ids) => {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT DISTINCT idUser from user WHERE ';
            const condition = 'idUser != ?';
            ids.forEach((id, i) => {
                sql += condition;
                if (i !== ids.length - 1) {
                    sql += ' AND '; 
                }
            });

            database.query(sql, ids, (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(data);
            });
        });
    },
    // sql: string of the SQL statement to execute
    // values (can be empty): array of values that's associated with SQL statement
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

// helper functions to validate if string is valid
// i.e. checks string to see if not empty, null, or undefined
function isValidString(input) {
    return (
        (input !== undefined) &&
        (input !== '') &&
        (input !== null)
    );
}

// checks to see if registration data is valid
// i.e. checks string to see if not empty, null, or undefined
function validRegistrationData(req) {
    if (
        !isValidString(req.body.hobby) ||
        !isValidString(req.body.username) ||
        !isValidString(req.body.password) ||
        !isValidString(req.body.confirmPassword) ||
        !isValidString(req.body.firstName) ||
        !isValidString(req.body.lastName) ||
        !isValidString(req.body.email)
        ) {
        return false;
    }

    return true;
}

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

app.get('/positive-comments-particular-user', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/positive-comments-particular-user.html'));
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
app.get('/rating/:idBlog', async (req, res) => {
    if (!req.params.idBlog) {
        res.status(400).send({status: 'error', error: 'Error: No blog id passed as a parameter.'});
        return;
    }
    
    try {
        const sql = 'SELECT rate FROM blog WHERE idBlog = ?';
        const data = await db.perform(req.params.idBlog);
        res.status(200).send({status: 'success', data});
    } catch(error) {
        res.status(400).send({status: 'error', error});
    }
});

// for updating the rating column of the blog table with a specific blog id
app.put('/rating', async (req, res) => {
    if (!req.body.rating || !req.body.idBlog) {
        res.status(400).send({status: 'error', error: 'Error: No new rating and/or blog id passed as a body parameter.'});
        return;
    }

    try {
        const sql = 'UPDATE blog SET rate = ? WHERE idBlog = ?';
        const data = await db.perform(sql, [req.body.rating, req.body.idBlog]);
        res.status(200).send({status: 'success', data});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

// add the comment to the database
app.post('/insert-comment/:idBlog', async (req, res) => {
    // idBlog is the id of the post you're commenting on
    if (!req.params.idBlog || !req.body.description || !req.body.username) {
        res.status(400).send({error: 'Error: ID blog, username, or description are empty.'});
        return;
    }

    try {
        const userData = await db.getIdOfUsername(req.body.username);

        const sql = 'SELECT idUser FROM blog WHERE idBlog = ?';
        const userOfBlog = await db.perform(sql, req.params.idBlog);
        
        // if the id of both the person who is commenting and the person who wrote the blog
        // are the same, error out since a user can't comment on their own post/blog
        const idOfCommentor = userData[0].idUser;
        const idOfPersonWhoPostedBlog = userOfBlog[0].idUser;
        if (idOfCommentor === idOfPersonWhoPostedBlog) {
            res.status(400).send({status: 'error', error: `Error: User can't comment on their own post.`});
            return;
        }
        
        const sql2 = 'SELECT idUser, date FROM comment WHERE idUser = ? AND DATE(`date`) = CURDATE()';
        const dataOfCommentTotal = await db.perform(sql2, idOfCommentor);
        const commentTotal = dataOfCommentTotal.length;

        // if user has already commented more than 3 or more times, error out
        if (commentTotal >= 3) {
            res.status(400).send({status: 'error', error: `Error: User has already commented 3 times total for today.`});
            return;
        }

        // insert comment into database
        const insertSql = 'INSERT INTO comment (idUser, date, description, idBlog, sentiment) VALUES (?, CURDATE(), ?, ?, ?)';
        // const values = [idUser, description, idBlog, sentiment];
        await db.perform(insertSql, [idOfCommentor, req.body.description, req.params.idBlog, req.body.sentiment]);
        res.status(200).send({status: 'success', data: 'Comment inserted succesfully!'});
        // res.status(200).send({status: 'success', data});
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
        const userData = await db.getIdOfUsername(req.body.username);
        const idUser = userData[0].idUser;

        const sql = 'INSERT INTO blog (idUser, subject, description, date, rate) VALUES (?, ?, ?, CURDATE(), ?)';
        const insertPost = await db.perform(sql, [idUser, req.body.subject, req.body.description]);
        const idBlog = insertPost.insertId;
        const tags = req.body.tags;

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
    const validateRegistrationData = (data) => {
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (element === '' || element === null || element === undefined) {
                return false;
            }
        }
        return true;
    }

    const {hobby, username, password, confirmPassword, firstName, lastName, email} = req.body;
    const values = [hobby, username, password, confirmPassword, firstName, lastName, email];

    const isValidData = validateRegistrationData(values);

    if (!isValidData) {
        res.status(400).send({status: 'error', error: 'One or more fields are empty or invalid'});
        return;
    }

    if (password === confirmPassword) {
        res.status(400).send({error: "Passwords do not match."});
        return;
    }
    
    const user = {
        hobby: req.body.hobby,
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
    }

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

app.post('/logout', (req, res) => {
    database.end();
})

app.listen(port, () => {
    console.log(`Server started on port ${port}.\nGo to localhost:${port} to view webpage.`)
});