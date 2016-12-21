var stream = require('stream');
function parseDashStatus(out,data){
    out.state = data[2];
}
function parsePackStatus(out,data){
    out.carName = data[2];
    data[3] = data[3];
    data[4] = data[4];
    data[5] = data[5];
    out.SOC = data[3];
    var flag = data[4] << 8 | data[5];
    out.flag = [];
    out.flag.push((flag&0x0000)==0x0000);
    out.flag.push((flag&0x0001)==0x0001);
    out.flag.push((flag&0x0002)==0x0002);
    out.flag.push((flag&0x0004)==0x0004);
    out.flag.push((flag&0x0008)==0x0008);
    out.flag.push((flag&0x0010)==0x0010);
    out.flag.push((flag&0x0020)==0x0020);
    out.flag.push((flag&0x0040)==0x0040);
    out.flag.push((flag&0x0080)==0x0080);
    out.flag.push((flag&0x0100)==0x0100);
    out.flag.push((flag&0x0200)==0x0200);
    out.flag.push((flag&0x0400)==0x0400);
    out.flag.push((flag&0x0800)==0x0800);
    out.flag.push((flag&0x1000)==0x1000);
    out.flag.push((flag&0x1000)==0x2000);
    out.flag.push((flag&0x1000)==0x4000);
    out.flag.push((flag&0x1000)==0x8000);
}
function parseVoltageData(out,data){
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
    out.difference_check = data[2];
    out.throttle = (data[3] & 0x7F) << 8 | data[4];
    var flag = data[6] << 24 | data[7] << 16 | data[8] << 8 | data[9];
    out.flag = [];
    out.flag.push((flag&0x0000)==0x0000);
    out.flag.push((flag&0x0001)==0x0001);
    out.flag.push((flag&0x0002)==0x0002);
    out.flag.push((flag&0x0004)==0x0004);
    out.flag.push((flag&0x0008)==0x0008);
    out.flag.push((flag&0x0010)==0x0010);
    out.flag.push((flag&0x0020)==0x0020);
    out.flag.push((flag&0x0040)==0x0040);
}
function parseBrake(out,data){
    out.difference_check = data[2];
    out.brake = (data[3] & 0x7F) << 8 | data[4];
    var flag = data[6] << 24 | data[7] << 16 | data[8] << 8 | data[9];
    out.flag = [];
    out.flag.push(flag&0x0000==0x0000);
    out.flag.push(flag&0x0001==0x0001);
    out.flag.push(flag&0x0002==0x0002);
    out.flag.push(flag&0x0004==0x0004);
    out.flag.push(flag&0x0008==0x0008);
    out.flag.push(flag&0x0010==0x0010);
    out.flag.push(flag&0x0020==0x0020);
    out.flag.push(flag&0x0040==0x0040);
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
    }
    _transform(chunk, encoding, next) {
        var transformed = this.parse(chunk);
        this.push(JSON.stringify(transformed));
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
            console.log(array);
            out.CAN_Id = array[0];
            out.Timestamp = array[1];
            chooseParser(out,array);   
            return out;
        }
        else return "";
    }
}
module.exports = parseStream;