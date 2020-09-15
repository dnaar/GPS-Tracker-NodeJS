const express = require('express');
const app = express();
const mysql = require('mysql');

app.listen(80);
app.use(express.static('MyWebApp'));

// UDP Listener
const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

socket.bind(10840);

// Credentials for connecting the database
const database = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '********',
    database: 'userdb'
});
// Establish connection
database.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to DB');
});

// UDP message receive and write to database
socket.on('message', (msg, rinfo) => {
    var _message;
    _message = msg.toString();
    _message = _message.split(',');
    _message = { latitude: parseFloat(_message[0]), longitude: parseFloat(_message[1]), timestamp: _message[2] }
    let sql = 'INSERT INTO locations SET ?';
    let query = database.query(sql, _message, (err, result) => {
        if (err) throw err;
    });
});

// Response handler and database reader
app.get('/loc', function (req, res) {
    let sql = 'SELECT * FROM userdb.locations WHERE idlocations = (SELECT MAX(idlocations)  FROM userdb.locations)'
    let query = database.query(sql, (err, result) => {
        if (err) throw err;
        res.end(JSON.stringify(result[0]));
    });
});
app.get('/historial', function (req, res) {
    let sql = 'SELECT * FROM locations'
    let query = database.query(sql, (err, result) => {
        if (err) throw err;
        res.end(JSON.stringify(result));
    });
});
