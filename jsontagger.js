var fs = require('fs');
const readline = require('readline');
var parser = require('./parser.js');
fs.readdir("intermediate",function(err,files){
    for(var i=0;i<files.length;i++)
    {
        var rl = readline.createInterface({input:fs.createReadStream("intermediate/"+files[i])});
        var outputFileName = "output/"+files[i];
        outputFileName = outputFileName.substring(0,outputFileName.length-3)+"json";
        rl.on('line',function(line){
            line = JSON.stringify(parser(line))+"\n";
            console.log("line:"+line);
            this.write(line);
        }.bind(fs.createWriteStream(outputFileName)));
    }
});