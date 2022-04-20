// REMEMBER: Prevent SQL attacks (i.e. sanitize input from user)
// We prevent SQL injection by using the '?' symbol in SQL statements
// https://github.com/mysqljs/mysql#escaping-query-values

const runner = require('run-my-sql-file'); // allows us to run sql files
const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const bodyParser = require('body-parser'); // parses body of http request
const INITIALIZE_DATA_FILE = 'schema.sql';

// for parsing body of requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// mysql database connection
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

// returns all the posts of all time
app.post('/posts', (req, res) => {
    const allPosts = 'SELECT * FROM blog ORDER BY idBlog DESC';
    database.query(allPosts, (error, data) => {
        if (error) {
            console.log(error);
            res.status(400).send({error: `SQL ERROR: ${error}`});
            return;
        }

        res.status(200).send({status: 'success', data})
    });
});

// returns data about a specific user from their id
app.post('/user/:id', (req, res) => {
    if (!req.params.id) {
        res.status(400).send({error: 'Error: No ID passed in.'});
        return;
    }

    const userData = 'SELECT idUser, username FROM user WHERE user.idUser = ?';
    database.query(userData, req.params.id, (error, data) => {
        if (error) {
            console.log(error);
            res.status(400).send({error: `SQL ERROR: ${error}`});
            return;
        }

        res.status(200).send({status: 'success', data})
    });
});

// handling user login
app.post('/create-post', (req, res) => {
    if (!req.body.username) {
        res.status(400).send({error: 'User is not logged in!'});
        return;
    }

    if (!req.body.subject || !req.body.description || !req.body.tags) {
        res.status(400).send({error: 'Blog fields were left empty.'});
        return;
    }

    // SQL statement to find the id of the user
    const selectSql = 'SELECT idUser FROM user WHERE username = ?';
    database.query(selectSql, req.body.username, (error, data) => {
        if (error) {
            console.log(error);
            res.status(400).send({error: `SQL ERROR: ${error}`});
            return;
        }

        const userId = data[0].idUser;

        // SQL statement to insert the blog into the 'blog' table alongside the user id
        // we queried earlier
        const insertSql = 'INSERT INTO blog (idUser, subject, description, date) VALUES (?, ?, ?, CURDATE())';
        const insertValues = [userId, req.body.subject, req.body.description];
        database.query(insertSql, insertValues, (error, data) => {
            if (error) {
                console.log(error);
                res.status(400).send({error: `SQL ERROR: ${error}`});
                return;
            }

            const blogId = data.insertId;
            const insertTagValues = req.body.tags;

            insertTagValues.forEach((tag) => {
                const values = [tag, blogId];

                // SQL statement to link the blog's id to the tags associated with the blog
                const insertTagSql = 'INSERT INTO tag (tagName, idBlog) VALUES (?, ?)';
                database.query(insertTagSql, values, (error, data) => {
                    if (error) {
                        console.log(error);
                        res.status(400).send({error: `SQL ERROR: ${error}`});
                        return;
                    }
            
                });
            });
        });
        res.status(200).send({status: 'success', message: 'Successfully inserted blog into database!'});
    });

    // fix later to use callbacks (like below) instead of nested async calls (like above)
    
    // const getUserId = (req, cb) => {
    //     const selectSql = 'SELECT idUser FROM user WHERE username = ?';
    //     database.query(selectSql, req.body.username, (error, data) => {
    //         if (error) {
    //             console.log(error);
    //             res.status(400).send({error: `SQL ERROR: ${error}`});
    //             return;
    //         }
    
    //         return cb(data[0].idUser);
    //     });
    // };

    // let uid = null;
    // getUserId(req, (result) => {
    //     uid = result;
    //     console.log(uid);
    //     // rest of code goes here
    // });
    // console.log(uid);
});

// handling user login
app.post('/welcome', (req, res) => {
    console.log('HERE');
    console.log(req.body);
    const sql = 'SELECT * FROM user WHERE username = ?';
    database.query(sql, req.body.username, (error, userData) => {
        if (error) {
            console.log(error);
            res.status(400).send({error: `SQL ERROR: ${error}`});
            return;
        }

        const userFound = userData.length > 0;
        if (!userFound) {
            res.status(400).send({error: "Username does not exist."});
            return;
        }

        // parsing user data to JSON object
        const parsedUserData = Object.values(JSON.parse(JSON.stringify(userData)))[0];

        const passwordsMatch = parsedUserData.password === req.body.password;
        if (!passwordsMatch) {
            res.status(400).send({error: "Password does not match."});
            return;
        }

        // if above condition aren't satisfied (meaning username is found and passwords match)
        // then redirect to welcome page
        res.sendFile(path.join(__dirname, 'pages/welcome.html'));
    });
});

app.post('/register', (req, res) => {
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
    const sql = 'INSERT INTO user SET ?';
    database.query(sql, user, (error, result) => {
        if (error) {
            res.status(400).send({error: error.sqlMessage});
            return;
        }

        console.log('Succesfully inserted user into database.');
        res.sendFile(path.join(__dirname, 'pages/welcome.html'));
    });
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
            res.status(400).send({error: error});
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