const Writable = require('stream').Writable;
var mongo = require("mongodb").MongoClient;
var EventEmitter = require('events');
var logger = require('../console/log.js');
class dbStream extends Writable {
    constructor(options) {
        super(options);
        this.buffer = [];
        this.emitter = new EventEmitter();
        var self = this;
        mongo.connect('mongodb://localhost/data',function(err,db){
            if(err)console.error.bind(console,"connection error");
            var d = new Date();
            let formatter = new Intl.NumberFormat('en-US', {minimumIntegerDigits: 2});
            self.db = db;
            self.collection = db.collection(d.getFullYear() + "."
                + formatter.format(d.getMonth() + 1) + "." + formatter.format(d.getDate())
                + "-" + formatter.format(d.getHours()) + "."
                + formatter.format(d.getMinutes())+ "."
                + formatter.format(d.getSeconds()));

            self.collection.createIndex("Timestamp");
            self.collection.createIndex("CAN_Id");
            console.log(self.collection.collectionName);
            if(self.buffer.length>0){
                self.collection.insertMany(self.buffer);
                console.log("write many");
            }
            self.emitter.emit("ready");
            delete self.buffer;
        });  
        this.on('unpipe',function(){
            if(self.db){
                self.db.close();
            }
        });    
    }
    _write(chunk,encoding,callback)
    {
        if(this.collection){
            //console.log("writing");
            this.collection.insert(JSON.parse(chunk));
        }
        else if(!this.collection){
            this.buffer.push(JSON.parse(chunk));
        }
        callback();
    }
    ready(callback){
        this.emitter.on("ready",callback);
    }
    save(){
        this.collection.find().toArray(function(err,docs){
            if(err) console.error(err);
            if(!docs || docs.length < 1) this.collection.drop(function(err, reply){
                if(err) console.error(err);
                console.log(reply);
            });
        }.bind(this));
    }
}
module.exports = dbStream;