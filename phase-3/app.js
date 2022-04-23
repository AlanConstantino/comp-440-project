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

const db = {
    // gets all blogs/posts ever posted
    getPosts: () => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM blog ORDER BY idBlog DESC';
            database.query(sql, (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
    
                resolve(data);
            });
        });
    },
    // returns the tags of whichever blog it's associated with given its id
    getTags: (idBlog) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM tag WHERE idBlog = ?';
            database.query(sql, idBlog, (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                
                resolve(data);
            });
        });
    },
    // returns the rating value of a specific blog given the blog's id
    getRating: (idBlog) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT rate FROM blog WHERE idBlog = ?';
            database.query(sql, idBlog, (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(data);
            });
        });
    },
    // returns all the comments associated with the id of a certain blog
    // and are returned in descending order by the id of the comment
    getComments: (idBlog) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM comment WHERE idBlog = ? ORDER BY idComment DESC';
            database.query(sql, idBlog, (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(data);
            });
        });
    },
    // update existing rating to new rating passed in alongside the blog's id
    updateRating: (rating, idBlog) => {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE blog SET rate = ? WHERE idBlog = ?';
            const values = [rating, idBlog];
            database.query(sql, values, (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(data);
            });
        });
    },
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
    // returns the user's user id of whoever wrote a particular blog based
    // on the blog's id
    getUserIdOfBlog: (idBlog) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT idUser FROM blog WHERE idBlog = ?';
            database.query(sql, idBlog, (error, data) => {
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
    register: (user) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO user SET ?';
            database.query(sql, user, (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
        
                resolve(result);
            });
        });
    },
    insertPost: (idUser, subject, description) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO blog (idUser, subject, description, date, rate) VALUES (?, ?, ?, CURDATE(), ?)';
            const values = [idUser, subject, description, 0];
            database.query(sql, values, (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                
                resolve(data);
            });
        });
    },
    insertTag: (tagName, idBlog) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO tag (tagName, idBlog) VALUES (?, ?)';
            const values = [tagName, idBlog];
            database.query(sql, values, (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(data);
            });
        });
    },
    insertComment: (idUser, description, idBlog) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO comment (idUser, date, description, idBlog) VALUES (?, CURDATE(), ?, ?)';
            const values = [idUser, description, idBlog];
            database.query(sql, values, (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
        
                resolve(data);
            });
        });
    },
    // figure out how many times a particular user has commented throughout
    // the day from their user id
    getCommentTotal: (idUser) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT idUser, date FROM comment WHERE idUser = ? AND DATE(`date`) = CURDATE()';
            database.query(sql, idUser, (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(data);
            });
        });
    },
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

// return the rating of the blog based on the blog's id
app.get('/rating/:idBlog', async (req, res) => {
    if (!req.params.idBlog) {
        res.status(400).send({error: 'Error: No blog id passed as a body parameter.'});
        return;
    }
    
    try {
        const data = await db.getRating(req.params.idBlog);
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
        const data = await db.updateRating(req.body.rating, req.body.idBlog);
        res.status(200).send({status: 'success', data});
    } catch (error) {
        res.status(400).send({status: 'error', error});
    }
});

// add the comment to the database
app.post('/insert-comment/:idBlog/', async (req, res) => {
    // idBlog is the id of the post you're commenting on
    if (!req.params.idBlog || !req.body.description || !req.body.username) {
        res.status(400).send({error: 'Error: ID blog, username, or description are empty.'});
        return;
    }

    try {
        const userData = await db.getIdOfUsername(req.body.username);
        const userOfBlog = await db.getUserIdOfBlog(req.params.idBlog);
        
        // if the id of both the person who is commenting and the person who wrote the blog
        // are the same, error out since a user can't comment on their own post/blog
        const idOfCommentor = userData[0].idUser;
        const idOfPersonWhoPostedBlog = userOfBlog[0].idUser;
        if (idOfCommentor === idOfPersonWhoPostedBlog) {
            res.status(400).send({status: 'error', error: `Error: User can't comment on their own post.`});
            return;
        }
        
        const dataOfCommentTotal = await db.getCommentTotal(idOfCommentor);
        const commentTotal = dataOfCommentTotal.length;

        // if user has already commented more than 3 or more times, error out
        if (commentTotal >= 3) {
            res.status(400).send({status: 'error', error: `Error: User has already commented 3 times total for today.`});
            return;
        }

        // insert comment into database
        await db.insertComment(idOfCommentor, req.body.description, req.params.idBlog);
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
        const data = await db.getComments(req.params.idBlog);
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
        const data = await db.getPosts();
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
        const data = await db.getTags(req.params.idBlog);
        res.status(200).send({status: 'success', data})
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
        const insertPost = await db.insertPost(idUser, req.body.subject, req.body.description);
        const idBlog = insertPost.insertId;
        const tags = req.body.tags;

        if (tags.length >= 1) {
            for (let i = 0; i < tags.length; i++) {
                await db.insertTag(tags[i], idBlog);
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
    if (!validRegistrationData(req)) {
        res.status(400).send({error: "One or more fields are empty or invalid."});
        return;
    }

    const passwordsMatch = req.body.password === req.body.confirmPassword;
    if (!passwordsMatch) {
        res.status(400).send({error: "Passwords do not match."});
        return;
    }
    
    const user = {
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
    }

    try {
        const data = await db.register(user);
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