var SerialPort = require("serialport");
SerialPort.list(function (err, ports) {
    ports.forEach(function(port) {
        console.log(port.comName);
        console.log(port.pnpId);
        console.log(port.manufacturer);
        if(port.manufacturer.includes("Arduino"))
        {
            var arduinoPort = new SerialPort(port.comName,{
                parser: SerialPort.parsers.readline('\n')
            });
            arduinoPort.on('error', function(err) {
                console.log('Error: ', err.message);
            })
            arduinoPort.on('data', function (data) {
                console.log('Data: ' + data);
            });
        }
    });
});