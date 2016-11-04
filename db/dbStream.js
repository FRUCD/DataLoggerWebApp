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
    }
    _writev(chunks,callback)
    {
        chunks.forEach(function (item, index, array) {
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
        });
    }
}
module.exports = dbStream;