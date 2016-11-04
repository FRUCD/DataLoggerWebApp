var express = require('express')
var app = express();
var fs = require('fs');
var readline = require('readline');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Serial = require('../serial/serial.js');
var Parser = require('../serial/testparser.js');
var Converter = require('csvtojson').Converter;
var parser = new Parser({decodeStrings:false,stringOut:true});
var converter = new Converter();
var read = require('fs').createReadStream("../csv/input/14-47-17.CSV");
//read.pause();
parser.pause();
io.on('connection',function(socket){
    //read.resume();
    parser.resume();
    socket.on('disconnect',function(){
        //read.pause();
        parser.pause();
    });
});
parser.on("data",function(data){
    console.log(JSON.parse(data));
    io.emit("data",JSON.parse(data));
    parser.pause();
    setTimeout(function(){
        parser.resume();
    },10);
});
read.pipe(converter).pipe(parser);
app.use(express.static("public"));
server.listen(80);
//yea literally this is all we need to run our server