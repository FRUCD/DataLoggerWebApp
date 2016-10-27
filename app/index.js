var app = require('express').createServer();
var io = require('socket.io')(app);
var Serial = require('../serial/serial.js');
var arduinoListener = new Serial();

app.use(express.static("public"));
app.listen(80);