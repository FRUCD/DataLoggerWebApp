var stream = require('stream');
function parseDashStatus(out,data){
    out.State = data[2];
}
function parsePackStatus(out,data){
    out.carName = data[2];
    out.SOC = data[3];
    out.flag = parseInt(data[4]) << 8 | parseInt(data[5]);
}
function parseVoltageData(out,data){
    /*out.min_voltage = data[2] << 8 | data[3];
    out.max_voltage = data[4] << 8 | data[5];
    out.pack_voltage = data[6] << 24 | data[7] << 16 | data[8] << 8 | data[9]; sketchy bit shifting */
}
function parseTemperature(out,data){
    out.temp_array = [];
    for(var i=2; i<data.length-2;i++){
        out.temp_array.push(data[i]);
    }
    out.highest = data[8];
    out.pack_max_temp = data[9];
}
function parseThrottle(out,data){
    //again will implement sketchy bit shifting after knowing the values from the arduino
}
function parseBrake(out,data){
    //3sketch5me
}
class parseStream extends stream.Transform{ //ES6 Javascript is now just Java, apparently
    constructor(options){
        super(options);
        if(options) this.stringOut = options.stringOut || false; //variable for string output (file write)
    }
    _transform(chunk, encoding, next) {
        var transformed = this.parse(chunk);
        if(this.stringOut) this.push(JSON.stringify(transformed)+"\n");
        else          this.push(transformed);
        next();
    }
    parse(data){
        if(data&&data.length>0){
            var out = new Object();
            data = JSON.parse(data);
            if(!data)return "";
            if(data instanceof Array)
            {
                out.CAN_Id = data[0];
                out.Timestamp = data[1];
                switch(data[0]){
                     case 1574:
                        parseDashStatus(out,data);
                        break;
                    case 513:
                        parseBrake(out,data);
                        break;
                    case 512:
                        parseThrottle(out,data);
                        break;
                    case 1160:
                        parseTemperature(out,data);
                        break;
                    case 392:
                        parsePackStatus(out,data);
                        break;
                    case 904:
                        parseVoltageData(out,data);
                        break;
                }
            }
            else if(data instanceof Object)
            {
                var array = [];
                for(var i=0;i<Object.keys(data).length;i++)
                {
                    array.push(data[Object.keys(data)[i]]);
                }
                out.CAN_Id = array[0];
                out.Timestamp = array[1];
                switch(array[0]){
                    case 1574:
                        parseDashStatus(out,array);
                        break;
                    case 513:
                        parseBrake(out,array);
                        break;
                    case 512:
                        parseThrottle(out,array);
                        break;
                    case 1160:
                        parseTemperature(out,array);
                        break;
                    case 392:
                        parsePackStatus(out,array);
                        break;
                    case 904:
                        parseVoltageData(out,array);
                        break;
                }
            }   
            return out;
        }
        else return "";
    }
}
module.exports = parseStream;