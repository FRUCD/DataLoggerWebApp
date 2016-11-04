var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Serial = require('../serial/serial.js');
var Parser = require('../serial/parser.js');
var dbStream = require('../db/dbStream.js');
var arduinoListener = new Serial();
var parser = new Parser({decodeStrings:false});
var database = new dbStream();
parser.on('data',function(data){
    io.emit(data);
});
arduinoListener.pipe(parser).pipe(database);
app.use(express.static("public"));
server.listen(80);
//yea literally this is all we need to run our server