const io = require('socket.io-client');
var socket = io("http://localhost:3000/src", {
    path:"/socket.io-client"
});
var can = [
    0x200,
    0x201,
    1574,
    392,
    1160,
    904
];
var array = [
    200,
    0, // timestamp
    20,
    20,
    20,
    20,
    20,
    20,
    20,
    20
];
setInterval(function() {
    array[0] = can[Math.floor(Math.random() * can.length)];
    array[1] = new Date().getTime();
    array[3] = Math.floor(Math.random() * 500);
    socket.emit('data', array);
}, 100);
