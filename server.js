const express = require('express');
const app = express();
const mysql= require('mysql');

app.listen(80);
app.use(express.static('MyWebApp'));

// UDP Listener
const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
//var _message;

socket.bind(10840);

//create connection
const database = mysql.createConnection({
    host: "localhost",
    user: "root",
    clave: "admin",
    database: "location"
        
});
//connect
database.connect((err) => {
    if (err){
        throw err;
    }    
    console.log('Se estableció la conexión');
});
 
// Message receive

database.connect(function(err) {
    if (err) throw err;
   console.log("Connected!");
   var sql = "INSERT INTO `data` (`latitud`, `longitud`, `time`, `date`) VALUES  ('"+_message[0]+"', '"+_message[1]+"', '"+_message[2]+"')";
    db.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Dato ingresado exitosamente");
    });
  });

// Response handler
app.get('/loc', function (req, res){
    let sql = 'SELECT * FROM data';
    let query = database.query(sql, (err, result) =>{
        if (err) throw err;
        res.end(JSON.stringify(result));
    });
});
 

/* app.get('/loc', function (req, res){
    res.end(JSON.stringify(_message));
}) */



  