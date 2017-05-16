var fs = require('fs');
var csv = require('csvtojson');
var Parser = require('../../serial/dynamicParser.js');
module.exports = function index(req,res){
    let file = req.file;
    let parser = new Parser();
    var array = [];
    parser.on('data',function(data){
        array.push(JSON.parse(data));
    });
    let stream = fs.createReadStream(file.path);
    let headerSet = false;
    csv({workerNum:4})
    .fromStream(stream)
    .on('csv', (csvRow)=>{
        csvRow = csvRow.slice(0,10);
        if(!headerSet){
            res.status(200);
            headerSet = true;
        }
        csvRow[0] = parseInt(csvRow[0], 16);
        let radix = 16;
        if(csvRow[0] == 1160) radix = 10;
        csvRow[1] = parseInt(csvRow[1]);
        for(let i = 2; i < csvRow.length; i++) {
            let val = parseInt(csvRow[i], radix);
            if(isNaN(val)) {
                val = parseInt(csvRow[i], 16);
            }
            csvRow[i] = val;
        }
        if(csvRow[2] == 255 && csvRow[3] == 255 && csvRow[4] == 255 && csvRow[5] == 255 && csvRow[6] == 255 && csvRow[7] == 255 && csvRow[8] == 255 && csvRow[9] == 255) {
            //crap data, return;
            return;
        }
        parser.write(JSON.stringify(csvRow));
        // csvRow is an array
    })
    .on('done',(error)=>{
        if(error) console.error(error);
        console.log("done reading csv");
        console.log(`Processed ${array.length} from csv`);
        res.send(array);
    })
}