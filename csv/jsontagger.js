var fs = require('fs');
const readline = require('readline');
var parser = require('../serial/parser.js');
fs.readdir("intermediate",function(err,files){ // 'intermediate/*.csv' file format
    for(var i=0;i<files.length;i++)
    {
        var rl = readline.createInterface({
            input:fs.createReadStream("intermediate/"+files[i])}); //creates stream for asynchronous parsing
        var outputFileName = "output/"+files[i];
        outputFileName = outputFileName.substring(0,outputFileName.length-3)+"json"; //removes.csv and adds .json
        rl.on('line',function(line){
            line = JSON.stringify(parser(line))+"\n";
            console.log("line:"+line);
            this.write(line);
        }.bind(fs.createWriteStream(outputFileName))); //bind the output file stream to 'this', cannot use 'files[i]' because it is out of scope
    }
});