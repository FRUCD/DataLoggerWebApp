var Converter = require("csvtojson").Converter;
var fs = require("fs"); 
//end_parsed will be emitted once parsing finished 
//read from file 

fs.readdir("input",function(err,files){
    for(var i=0;i<files.length;i++)
    {
        var string = fs.readFileSync("input/"+files[i]);
        if(string.length>0){
            string = string.toString();
            var can = string.substring(0,6);
            if(can!="CAN_ID") string = "CAN_ID,Timestamp,bit1,bit2,bit3,bit4,bit5,bit6,bit7,bit8\n"+string;
            fs.writeFileSync("input/"+files[i],string);
            var converter = new Converter({});
            var out = fs.createWriteStream("intermediate/"+files[i]);
            fs.createReadStream("input/"+files[i]).pipe(converter).pipe(out);
        }
    }
});
