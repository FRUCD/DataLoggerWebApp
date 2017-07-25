var Parser = require('../serial/dynamicParser.js');
var parser = new Parser();
var start = new Date().getTime();
console.log("start time: " + start);
parser.on('data', function(data) {
    console.log(data);
})
parser.on('finish', function() {
    var total = new Date().getTime() - start;
    console.log("time taken: ");
    console.log(total);
    console.log("average frame time: ");
    console.log(total / 100000);
    console.log("average frame rate: ");
    console.log(1000 / (total / 100000));
});
var array = [
    200,
    0, // timestamp
    20,
    20,
    20,
    20,
    20,
    20,
    20,
    20
];
for(var i = 0; i < 100000; i++) {
    array[1] = new Date().getTime();
    parser.write(JSON.stringify(array));
}
parser.end();