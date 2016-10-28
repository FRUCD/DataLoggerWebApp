var socket = io.connect('http://localhost');
var body = document.getElementById("body");
socket.on('data', function (data) {
    console.log("message");
    var p = document.createElement("p");
    p.innerText = JSON.stringify(data);
    document.body.appendChild(p);
});