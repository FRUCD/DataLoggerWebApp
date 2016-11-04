<<<<<<< HEAD
const Writable = require('stream').Writable;
var mongo = require("mongodb").MongoClient;
class dbStream extends Writable {
    constructor(options) {
        super(options);
        this.buffer = [];
        var self = this;
        mongo.connect('mongodb://localhost/data',function(err,db){
            if(err)console.error.bind(console,"connection error");
            self.collection = db.collection(Date.getMonth()+"/"+Date.getDate()+"/"+Date.getFullYear()+"-"+Date.getHours()+"."+Date.getMinutes()+"."+Date.getSeconds());
            self.collection.insertMany(self.buffer);
            delete self.buffer;
        });        
    }
    _write(chunk,encoding,callback)
    {
        if(this.collection){
            this.collection.insertOne(JSON.parse(chunk));
        }
        else if(!this.collection){
            this.buffer.push(JSON.parse(chunk));
        }
=======
"use strict";

const Writable = require('stream').Writable;
var mongoose = require("mongoose");

var dataSchema = mongoose.Schema({
    date: Date,
    data: Object
});

var dataPoint = mongoose.model('dataPoint', dataSchema);


class dbStream extends Writable {
    constructor(options) {
        super(options);
        mongoose.connect('mongodb://localhost/data');
        this.db = mongoose.connection;
        this.db.on('error', console.error.bind(console, 'connection error:'));
    }
    _write(chunk,encoding,callback)
    {
        if(chunk instanceof Buffer)
            var str = chunk.toString();
        else
            var str = chunk;
        var dp = new dataPoint({ date: Date.now(), data: JSON.parse(str) });
        dp.save(function (err, dp) {
            if(err) {
                console.error.bind(console, err);
            }
        });
>>>>>>> added dbstream class
    }
    _writev(chunks,callback)
    {
        chunks.forEach(function (item, index, array) {
<<<<<<< HEAD
            if(this.collection){
                this.collection.insertOne(JSON.parse(item));
            }
            else if(!this.collection){
                this.buffer.push(JSON.parse(item));
            }
=======
            if(chunk instanceof Buffer)
                var str = item.chunk.toString();
            else
                var str = item.chunk;
            var dp = new dataPoint({ date: Date.now(), data: JSON.parse(str) });
            dp.save(function (err, dp) {
                if(err) {
                    console.error.bind(console, err);
                }
            });
>>>>>>> added dbstream class
        });
    }
}
module.exports = dbStream;