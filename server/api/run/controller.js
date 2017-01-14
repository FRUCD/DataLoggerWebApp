var dbStream = require('../../db/dbStream.js');
class Controller{
    constructor(db,parser){
        this.db = db;
        this.parser = parser;
    }
    start(req,res){
        if(!this.parser.isPaused()){
            res.sendStatus(401);
            return;
        } 
        var database = new dbStream();
        this.parser.pipe(database);
        this.parser.resume();
        database.ready(function(){
            res.status(200).send(database.collection.collectionName);
        });
        this.db = database;
    }
    stop(req,res){
        this.parser.unpipe();
        this.parser.pause();
        this.parser.specification = [];
        res.status(200).send("Stopped");
    }
    current(req,res){
        if(this.parser.isPaused()) res.status(200).send("Stopped");
        else if(this.db&&this.db.collection&&this.db.collection.collectionName) res.status(200).send(this.db.collection.collectionName);
        else{
            res.sendStatus(401);
        }
    }
}
module.exports = Controller;