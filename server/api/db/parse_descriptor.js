var Mongoose = require('mongoose');
var Q = require('q');
Mongoose.Promise = require('q').Promise;
var path = require('path');
var local = path.resolve(__dirname);
var fs = require('fs');
var assert = require('assert');
var mongoose = Mongoose.createConnection("mongodb://localhost/data");
var canDescription  = new Mongoose.Schema({
    CAN_Id: {
        type:Number,
        unique:true,
        index:true
    },
    PDO_Description:String,
    map:[{
        _id:false,
        key:String,
        description:String,
        length:Number, //if datatype is array, refers to number of array elements
        offset:Number,
        dataType:{
            type:String,
            match:/flag|state|decimal|string|array/
        },
        array:{
            subLength:Number,
            subDataType:{
                type:String,
                match:/flag|state|decimal|string/
            }
        }
        }]
});
var model = mongoose.model('Descriptor',canDescription);
function load(){
    fs.readFile(`${local}/defaults.conf`,function(err,data){
        var defaults = JSON.parse(data);
        console.log(defaults);
        Object.keys(defaults).forEach(function(key,index,array){
            model.count({"CAN_Id":defaults[key].CAN_Id},function(err,countr){
                if(countr==0){
                    if(defaults[key]){
                        model.create(defaults[key],function(err,doc){
                            if(err) console.error(err);
                        })
                    }
                }
            })
        });
    });
}
load();
module.exports.model = model;
