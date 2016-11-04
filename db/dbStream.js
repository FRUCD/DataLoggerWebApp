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
    }
    _writev(chunks,callback)
    {
        chunks.forEach(function (item, index, array) {
            if(this.collection){
                this.collection.insertOne(JSON.parse(item));
            }
            else if(!this.collection){
                this.buffer.push(JSON.parse(item));
            }
        });
    }
}
module.exports = dbStream;