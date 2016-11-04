var assert = require('assert');
var Parser = require('../parser.js');
describe("array test",function(){
    it("CAN ID 1574",function(){
        var parser = new Parser();
        var input = [1574,16777072];
        for (var i=0;i<8;i++) input.push(0);
        var out = parser.parse(JSON.stringify(input));
        assert.deepEqual({CAN_Id:1574,Timestamp:16777072,State:0},out);
    });
});
describe("object test",function(){
    it("CAN ID 1574",function(){
        var parser = new Parser();
        var input = {CAN_ID:1574,Timestamp:16777072,bit1:0,bit2:0,bit3:0,bit4:0,bit5:0,bit6:0,bit7:0,bit8:0};
        var out = parser.parse(JSON.stringify(input));
        assert.deepEqual({CAN_Id:1574,Timestamp:16777072,State:0},out);
    });
});