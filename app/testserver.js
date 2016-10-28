var express = require('express')
var app = express();
var fs = require('fs');
var readline = require('readline');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Serial = require('../serial/serial.js');
var Parser = require('../serial/parser.js');
var parser = new Parser({decodeStrings:false});
io.on('connection',function(socket){
    rl.resume();
    socket.on('disconnect',function(){
        rl.pause();
    });
});
var rl = readline.createInterface({input:fs.createReadStream("../csv/output/14-47-17.json")});
rl.pause();
rl.on('line',function(line){
    io.emit("data",JSON.parse(line));
});
app.use(express.static("public"));
server.listen(80);
//yea literally this is all we need to run our server