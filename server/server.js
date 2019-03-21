require('./constant');
const express    = require('express');
const pgPool     = require('./db');
const app        = express();
const http       = require('http').createServer(app);
const io         = require('socket.io')(http);
const path       = require('path');
const port       = process.env.PORT || 3000;
const router     = express.Router();
const jwt        = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors       = require('cors');
const bcrypt     = require('bcrypt');
const saltRounds = 10;
let usersOnline  = 0;
let user         = [];
let usernames    = {};
// Use this routing after app build
// app.use(express.static(path.join(__dirname, 'dist')));

/*--------------------------------- EXPRESS ROUTING SECTION BEGINS ---------------------------------*/
/*PARSE APPLICATION/JSON*/
app.use(bodyParser.json());

/*PARSE APPLICATION?X_WWW_FORM_URLENCODED*/
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cors());

/* API ROUTE FOR LOGIN*/
app.post('/login', function (req, res, next) {
    sql_where = "username = " + "'" + req.body.username + "'" + " AND " + " password = " + "'" + req.body.password + "'";
    var qry = "SELECT username, password, access_token FROM app_user where " + sql_where;
    console.log(qry);
    if (typeof req.body.username != 'undefined') {
        pgPool.runQuery(qry, function (err, result) {
            var resp = {
                "success": false,
            };
            if (err){//query error
                resp['error'] = err;
                resp['msg'] = "Invalid SQL Syntax";
                res.status(500).json(resp);
            }
            else{//query not error
                console.log(result.rows[0].password);
                if (result.rowCount != 0){//has result.rowCount
                    // const hashedPassword = bcrypt.compare(req.body.password, result.rows[0].password);
                    // console.log(hashedPassword);
                    // console.log('passBcrypt');
                    // if(hashedPassword == true){
                        // console.log('passBcrypt');
                        resp['msg'] = "User Found.";
                        resp['data'] = result.rowCount == 0 ? {} : result.rows;
                        resp['success'] = true;
                        res.status(200).json(resp);
                    // }
                } else { //has no result.rowCount
                    resp['msg'] = "Could not find User with given UserName and Password.";
                    resp['success'] = false;
                    res.status(200).json(resp);
                }
            }
            res.end();
        });
    }
});

/* API ROUTE FOR SIGNUP*/
app.post('/signup', function (req, res, next) {
    // bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        // console.log(hash);
        var token = jwt.sign({
                username: req.body.username
            }, 'helloWorld', {
                expiresIn: 86400
            }),
            qry = "INSERT INTO app_user (username, password, first_name, last_name, email, access_token) VALUES ('" + req.body.username + "','" + hash + "','" + req.body.firstname + "','" + req.body.lastname + "','" + req.body.email + "','" + token + "')";
        if (typeof req.body.username != 'undefined') {
            pgPool.runQuery(qry, function (err, result) {
                var resp = {
                    "success": false,
                };
                if (err) {
                    resp['error'] = err;
                    resp['msg'] = "Invalid SQL Syntax";
                    res.status(500).json(resp);
                } else {
                    if (result.rowCount != 0) {
                        resp['msg'] = "Sign Up Successful.";
                        resp['success'] = true;
                        res.status(200).json(resp);
                    } else {
                        resp['msg'] = "Sorry, Unable to SignUp at the moment.";
                        resp['success'] = false;
                        res.status(200).json(resp);
                    }
                }
                res.end();
            });
        }
    // });
});

//update user status on login for now is_locked
app.get('/updateUserStatus', function (req, res, next) {
    let query = {};
    sql_set = "SET status = " + "'"+req.query.status+"'";
    sql_where = " WHERE username = " + "'" + req.query.username + "'";
    var qry = "UPDATE app_user "+ sql_set + sql_where;
    pgPool.runQuery(qry, function (err, result) {
    console.log(qry);
        if (err) {
            res.status(400).send(err);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get('/allUsers', function (req, res, next) {
    var qry = "SELECT  username, status FROM app_user";
    pgPool.runQuery(qry, function (err, result) {
        if (err) {
            res.status(400).send(err);
        } else {
            res.status(200).send(result.rows);
        }
    });
});

app.get('/allUsersAllData', function (req, res, next) 
{
    var qry = "SELECT  * FROM app_user";
    pgPool.runQuery(qry, function (err, result){
        if (err){
            res.status(400).send(err);
        }else{
            res.status(200).send(result.rows);
        }
    });
});

/*--------------------------------- EXPRESS ROUTING SECTION ENDS ---------------------------------*/

/*--------------------------------- SOCKET IO CONNECTION BEGINS ----------------------------------*/
//--START--ChatServer------------------------------------------------------------------------------------------------------------
io.on('connection', (socket) => {
    usersOnline++;
    console.log(`CONNECTED, User opening our app @ any page = ${usersOnline }`);
    connected = true;
    socket.join('Global'); //making default room on connection
    io.emit('usersOnline', user);
    console.log(user);
    // after login push username to user[] and emit ALL users list
    socket.on('add_user', (username) => {
        socket.username = username;
        usernames= username;
        user.push(username);
        io.emit('usersOnline', user);
    });

    //on message received brodcast to all or to specific room
    socket.on('new-message', (userName, message, room) => {
        console.log(room +' received');
        console.log(userName);
      if(room=='Global'){
        io.in(room).emit('newRoomMsg',userName, message);
      }else{
        io.in(room).emit('newRoomMsg',userName, message);
      }
    });

    //on user is typing/keypress emit to others this user is typing
    socket.on('typing',(user,room) =>{
        socket.broadcast.to(room).emit('userTyping', { message: user + ' is typing....' });
    });

    socket.on('join', function (user, room) {
        if (room != null) {
            if (room == 'Global') {
                socket.emit('roomJoinMsg', {roomMsg: 'Already in ' + room + ' Room.'});
            } else {
                socket.leave('Global');
                socket.join(room);
                socket.emit('roomJoinMsg', {roomMsg: 'Welcome to Room ' + room + '.'});
                socket.broadcast.to(room).emit('newUserJoined', {message: user + ' has joined ' + room + '.'});
            }
        }
    });

    socket.on('leave', function (user, room) {
        if (room == 'Global') {
            socket.emit('roomJoinMsg', {roomMsg: 'Sorry,Global Room cant be Left'});
        } else {
            socket.broadcast.to(room).emit('leftRoom', {message: user + ' has left this room :' + room + '.'});
            socket.leave(room);
            socket.join('Global');
        }
    });

    socket.on('privateChat', function (userToChatWith,user) {
        console.log(userToChatWith);
        console.log(user);
        socket.join(userToChatWith);
        socket.emit('privateRoomJoinMsg', { roomMsg: 'Private Message With ' + userToChatWith + '.'});
    });

    socket.on('logOut', (username) => {
        usersOnline--;
        for (var i = 0; i < user.length; i++) {
            if (user[i] == username) {
                user.splice(i, 1);
            }
        }
        io.emit('usersOnline', user);
        console.log(user);
        console.log(`Logged Out, User opening our app @ any page = ${usersOnline }`);
    });
    
    socket.on('disconnect', () => {
        usersOnline--;
        connected = false;
        setTimeout(function () {
            console.log(connected);
            if(connected==false){
                for (var i = 0; i < user.length; i++) {
                    if (user[i] == socket.username) {
                        user.splice(i, 1);
                    }
                }
                io.emit('usersOnline', user);
            }
        }, 3000);
        console.log(user);
        console.log(`DISCONNECTED,User opening our app @ any page = ${usersOnline }`);
    });
});
/*--------------------------------- SOCKET IO CONNECTION ENDS ----------------------------------*/

/*----------------------------------START NODE SERVER-------------------------------------------*/
http.listen(port, () => {
    console.log(`Server Listning/Running on port http://localhost:${port}`);
});
/*----------------------------------END NODE SERVER-------------------------------------------*/