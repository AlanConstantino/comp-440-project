// REMEMBER: Prevent SQL attacks (i.e. sanitize input from user)

const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/index.html'));
});

app.post('/login', (req, res) => {
    // do login authentication here
    // 1. does email/username exists in database
    //    - if not return error (maybe redirect to register page)
    // 2. does password inputted match what's in database
    //    - if not return error
});

app.post('/register', (req, res) => {
    // do register authentication here
    // 1. make sure fields aren't empty
    //    - if empty return error
    // 2. verify valid email address with regex
    //    - if not valid email return email error
    // 3. verify passwords match
    //    - if no match return password matching error
    // 4. iff the above passes, then add user to database
    //    - if success, return success message and redirect user to welcome
    //    - if error when adding to database, throw SQL error
});

app.listen(port, () => {
    console.log(`Server started on port ${port}.\nGo to localhost:${port} to view webpage.`)
});