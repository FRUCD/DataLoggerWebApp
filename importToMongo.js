var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/test';
test = require('assert');



var Converter = require("csvtojson").Converter;
var converter = new Converter({});
var fs = require("fs");
var jsonString;

var currentDateTime = new Date();

console.log(currentDateTime);


var insertDocument = function (db, inData, callback) {
        db.collection('newCollection').insert({first_name: inData}, function (err, docs) {

            assert.equal(err, null);

            console.log("inserted");

            callback();
        });
};


var insertData = function(inData) {

    // Use connect method to connect to the Server
    MongoClient.connect(url, function (err, db) {

        //ensure we are connceted
        assert.equal(null, err);

        insertDocument(db, inData, function () {
            db.close();

        });


    });

};

//insertData("Albert");

















