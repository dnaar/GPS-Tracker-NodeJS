const express = require('express');
const app = express();
const mysql = require('mysql');
const credentials = require('./credentials.json');

app.use(express.static('MyWebApp'));
app.use(express.json({ limit: '1mb' }));
app.listen(80);

// UDP Listener
const dgram = require('dgram');
const firstTruck = dgram.createSocket('udp4');
const secondTruck = dgram.createSocket('udp4');

firstTruck.bind(10840);
secondTruck.bind(10841);

// Credentials for connecting the database
const database = mysql.createConnection({
    host: credentials.host,
    user: credentials.user,
    password: credentials.password,
    database: credentials.database
});

// Establish connection
database.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to DB');
});

// UDP message receive and write to database for first truck
firstTruck.on('message', (msg, rinfo) => {
    var _message;
    _message = msg.toString();
    _message = _message.split(',');
    _message = { latitude: parseFloat(_message[0]), longitude: parseFloat(_message[1]), timestamp: parseInt(_message[2]), lumx: _message[3], accel: parseFloat(_message[4]) };
    let sql = 'INSERT INTO locations1 SET ?';
    let query = database.query(sql, _message, (err, result) => {
        if (err) {
            return;
        }
    });
});

// UDP message receive and write to database for second truck
secondTruck.on('message', (msg, rinfo) => {
    var _message;
    _message = msg.toString();
    _message = _message.split(',');
    _message = { latitude: parseFloat(_message[0]), longitude: parseFloat(_message[1]), timestamp: parseInt(_message[2]), lumx: _message[3], accel: parseFloat(_message[4]) };
    let sql = 'INSERT INTO locations2 SET ?';
    let query = database.query(sql, _message, (err, result) => {
        if (err) {
            return;
        }
    });
});

// Response handler for last known location
app.get('/loc/:vehicle', function(req, res) {
    let sql = `SELECT * FROM locations${req.params.vehicle} WHERE idlocations = (SELECT MAX(idlocations)  FROM locations${req.params.vehicle})`
    let query = database.query(sql, (err, result) => {
        if (err) {
            res.end(JSON.stringify([]));
            return;
        }
        res.end(JSON.stringify(result[0]));
    });
});

// Response handler for filtered and today´s locations
app.post('/historial/:vehicle', (req, res) => {
    let sql = `SELECT * FROM locations${req.params.vehicle} WHERE timestamp BETWEEN ${req.body.start} and ${req.body.end}`;
    let query = database.query(sql, (err, result) => {
        if (err) {
            res.end(JSON.stringify([]));
            return;
        }
        res.end(JSON.stringify(result));
    });
});