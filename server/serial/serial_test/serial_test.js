var Serial = require('../serial.js');
var serial = new Serial({decodeString:false});
serial.connect();
console.log("connected");
console.log(serial.arduinoPort);
serial.pipe(process.stdout);