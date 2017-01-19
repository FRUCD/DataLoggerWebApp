const Writable = require('stream').Writable;
var mongo = require("mongodb").MongoClient;
var EventEmitter = require('events');
class dbStream extends Writable {
    constructor(options) {
        super(options);
        this.buffer = [];
        this.emitter = new EventEmitter();
        var self = this;
        mongo.connect('mongodb://localhost/data',function(err,db){
            if(err)console.error.bind(console,"connection error");
            var d = new Date();
            self.db = db;
            self.collection = db.collection(d.getFullYear()+"."+(d.getMonth()+1)+"."+d.getDate()+"-"+d.getHours()+"."+d.getMinutes()+"."+d.getSeconds());
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
}
module.exports = dbStream;