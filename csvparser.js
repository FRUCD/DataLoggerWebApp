var Converter = require("csvtojson").Converter;
var converter = new Converter({});
var fs = require("fs"); 
//end_parsed will be emitted once parsing finished 
converter.on("end_parsed", function (jsonArray) {
    jsonArray.forEach(function(value,index,array){
        switch(value.CAN_ID)
        {
            case 1574:
                value.PDO_Description = "TPDO1 Dash Status";
                value.State = value.bit1;
                delete value.bit1;
                break;
        } 
    });
   fs.writeFile('output/14-47-17.json',JSON.stringify(jsonArray)); 
});
 
//read from file 
fs.createReadStream("input/14-47-17.CSV").pipe(converter);