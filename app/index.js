var app = require('express').createServer();
var io = require('socket.io')(app);
var Serial = require('../serial/serial.js');
var Parser = require('../serial/parser.js');
var arduinoListener = new Serial();
var parser = new Parser({decodeStrings:false});
parser.on('data',function(data){
    io.emit(data);
});
arduinoListener.pipe(parser);
app.use(express.static("public"));
app.listen(80);
//yea literally this is all we need to run our server