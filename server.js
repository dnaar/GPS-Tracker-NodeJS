const express = require('express');
const app = express();
const mysql= require('mysql');

//create connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    clave: "admin",
    database: "location"
        
});
//connect
/* db.connect((err) => {
    if (err){
        throw err;
    
    }    
    console.log('Mysql Connected...');
}); */
// add data
 

 
app.listen(80);
app.use(express.static('MyWebApp'));

// UDP Listener
const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
var _message;

socket.bind(10840);

// Message receive
socket.on('message', (msg, rinfo) => {
    _message = msg.toString();
    _message = _message.split(',');
    _message = {latitude: parseFloat(_message[0]), longitude: parseFloat(_message[1]), timestamp: _message[2]}
    console.log(_message);
});

// Response handler
app.get('/loc', function (req, res){
    res.end(JSON.stringify(_message));
})

db.connect(function(err) {
    if (err) throw err;
   console.log("Connected!");
   var sql = "INSERT INTO `data` (`latitud`, `longitud`, `time`, `date`) VALUES  ('"+_message+"',  1,  2, '5')";
    db.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });
  });


  