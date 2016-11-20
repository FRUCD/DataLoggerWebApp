const Writable = require('stream').Writable;
var mongo = require("mongodb").MongoClient;
class dbStream extends Writable {
    constructor(options) {
        super(options);
        this.buffer = [];
        var self = this;
        mongo.connect('mongodb://localhost/data',function(err,db){
            if(err)console.error.bind(console,"connection error");
            var d = new Date();
            self.collection = db.collection(d.getMonth()+"/"+d.getDate()+"/"+d.getFullYear()+"-"+d.getHours()+"."+d.getMinutes()+"."+d.getSeconds());
            if(self.buffer.length>0){
                self.collection.insertMany(self.buffer);
                console.log("write many");
            }
            delete self.buffer;
        });        
    }
    _write(chunk,encoding,callback)
    {
        if(this.collection){
            console.log("writing");
            this.collection.insert(JSON.parse(chunk));
        }
        else if(!this.collection){
            this.buffer.push(JSON.parse(chunk));
        }
        callback();
    }
}
module.exports = dbStream;