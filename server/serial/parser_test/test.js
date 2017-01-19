var assert = require('assert');
var Parser = require('../parser.js');
var dynamicParser = require('../dynamicParser.js');
describe("parser",function(){
    describe("array test",function(){
        it("CAN ID 1574",function(){
            var parser = new Parser();
            var input = [1574,16777072];
            for (var i=0;i<8;i++) input.push(0);
            var out = parser.parse(JSON.stringify(input));
            assert.deepEqual({CAN_Id:1574,Timestamp:16777072,state:0},out);
        });
    });
    describe("object test",function(){
        it("CAN ID 1574",function(){
            var parser = new Parser();
            var input = {CAN_ID:1574,Timestamp:16777072,bit1:0,bit2:0,bit3:0,bit4:0,bit5:0,bit6:0,bit7:0,bit8:0};
            var out = parser.parse(JSON.stringify(input));
            assert.deepEqual({CAN_Id:1574,Timestamp:16777072,state:0},out);
        });
    });
});
describe("dynamicParser",function(){
    it("should create a new instance",function(done){
        var parser = new dynamicParser({done:done});
        assert.ok(parser);
    });
    it("getDecimal()",function(){
        var parser = new dynamicParser();
        var data = [512,111600,0b10010100,0b10011000,0,0,0,0,0x10,0x02];
        var value = parser.getDecimal(data.slice(),{
            "key":"throttle",
            "description":"throttle value up to 0x7FF",
            "offset":2,
            "length":12,
            "dataType":"decimal"
        });
        assert.equal(value,0b010100100110);
        value = parser.getDecimal(data.slice(),{
            "key":"throttle",
            "description":"throttle value up to 0x7FF",
            "offset":1,
            "length":12,
            "dataType":"decimal"
        });
        assert.equal(value,0b001010010011);
        value = parser.getDecimal(data.slice(),{
            "key":"throttle",
            "description":"throttle value up to 0x7FF",
            "offset":4,
            "length":3,
            "dataType":"decimal"
        });
        assert.equal(value,0b010);
        value = parser.getDecimal(data.slice(),{
            "key":"throttle",
            "description":"throttle value up to 0x7FF",
            "offset":8,
            "length":5,
            "dataType":"decimal"
        });
        assert.equal(value,0b10011);
    });
    it("getFlag()",function(){
        var parser = new dynamicParser();
        var data = [512,111600,0b10010100,0b10011000,0,0,0x00,0x00,0x10,0x02];
        var value = parser.getFlag(data.slice(),{
            "key":"flag",
            "description":"current state of the throttle node",
            "length":32,
            "offset":32,
            "dataType":"flag"
        });
        var flag = [false,false,true,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];
        assert.ok(flag.length==33);
        assert.deepEqual(value,flag);
    });
})