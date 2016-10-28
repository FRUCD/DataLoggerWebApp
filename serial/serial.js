function getSerialPort() {

    SerialPort.list(function (err, ports) {
        ports.forEach(function (port) {
            console.log(port.comName);
            console.log(port.pnpId);
            console.log(port.manufacturer);
            if (port.manufacturer.includes("Arduino")) {
                var arduinoPort = new SerialPort(port.comName, {
                    parser: SerialPort.parsers.readline('\n')
                });
                arduinoPort.on('error', function (err) {
                    console.log('Error: ', err.message);
                })
                arduinoPort.on('data', function (data) {
                    console.log('Data: ' + data);
                });
            }
        });
    });
}

class serialStream extends stream.readable
{
    SerialPort = require("serialport");
    constructor(options)
    {
        super(options);
        SerialPort.list(function (err, ports) {
            ports.forEach(function (port) {
                console.log(port.comName);
                console.log(port.pnpId);
                console.log(port.manufacturer);
                if (port.manufacturer.includes("Arduino")) {
                    this.arduinoPort = new SerialPort(port.comName, {
                        parser: SerialPort.parsers.readline('\n')
                    });
                }
            });
        });
    }
    _read()
    {

    }
}
