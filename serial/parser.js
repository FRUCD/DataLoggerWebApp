var stream = require('stream');
function parseDashStatus(out,data){
    out.State = data[2];
}
function parsePackStatus(out,data){
    out.carName = data[2];
    data[3] = parseInt("0x"+data[3]);
    data[4] = parseInt("0x"+data[4]);
    data[5] = parseInt("0x"+data[5]);
    out.SOC = data[3];
    out.flag = data[4] << 8 | data[5];
}
function parseVoltageData(out,data){
    for(var i=2;i<data.length;i++){
        data[i] = parseInt("0x"+data[i]);
    }
    out.min_voltage = (data[2] << 8) | data[3];
    out.max_voltage = (data[4] << 8) | data[5];
    out.pack_voltage = (data[6] << 24) | (data[7] << 16) | (data[8] << 8) | data[9];
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
    for(var i=2;i<data.length;i++){
        data[i] = parseInt("0x"+data[i]);
    }
    out.difference_check = data[2] & 0x80;
    out.throttle = (data[2] & 0x7F) << 8 | data[3];
    out.flag = data[6] << 24 | data[7] << 16 | data[8] << 8 | data[9];
}
function parseBrake(out,data){
    for(var i=2;i<data.length;i++){
        data[i] = parseInt("0x"+data[i]);
    }
    out.difference_check = data[2] & 0x80;
    out.brake = (data[2] & 0x7F) << 8 | data[3];
    out.flag = data[6] << 24 | data[7] << 16 | data[8] << 8 | data[9];
}
function chooseParser(out,data){
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
            var array = [];
            if(data instanceof Object)
            {
                for(var i=0;i<Object.keys(data).length;i++)
                {
                    array.push(data[Object.keys(data)[i]]);
                }
            }
            else array = data;
            out.CAN_Id = array[0];
            out.Timestamp = array[1];
            chooseParser(out,array);   
            return out;
        }
        else return "";
    }
}
module.exports = parseStream;