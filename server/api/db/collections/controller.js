var MongoClient = require('mongodb').MongoClient;
var database;
var activeCallback;

function sort(collections){
  collections.sort(function(a,b){
    return -a.localeCompare(b);
  });
}
function quicksort(collections,low,high){
  if(low<high){
    let pivot = collections[high];
    let i = low;
    for(var j = low; j<high;j++){
      if(collections[j].localeCompare(pivot)>-1){
        let temp = collections[j];
        collections[j] = collections[i];
        collections[i] = temp;
        i=i+1;
      }
    }
    let swap = collections[high];
    collections[high] = collections[i];
    collections[i] = swap;
    quicksort(collections,low,i-1);
    quicksort(collections,i+1,high);
  }
}
MongoClient.connect('mongodb://localhost/data',function(err,db){
  if(err){
    console.error(err);
    return;
  }
  database = db;
});

export function list(req,res){
  database.listCollections({name:/[0-9]+.[0-9]+.[0-9]+-[0-9]+.[0-9]+.[0-9]+/}).toArray(function (err,array) {
    if(err) console.error(err);
    var collections = [];
    array.forEach(function(value,index,array){
      collections.push(value.name);
    });
    sort(collections);
    console.log(`Found ${collections.length} collections`);
    res.status(200).send(collections);
  });
}
export function download(req,res){
  var name = req.params.collection;
  var fileType = req.params.fileType;
  if(fileType=="json") {
    res.attachment(`${name}.json`);
  }
  else if(fileType=="csv") res.attachment(`${name}.csv`);
  else{
    res.status(401).end();
    return;
  }
  var collection = database.collection(name);
  if(fileType=="json"){
    collection.find().project({_id:0,raw:0}).sort({Timestamp:1, CAN_Id:1}).forEach(function(element)
    {
        res.write(JSON.stringify(element)+'\r\n');
    },function(err){
      if(err){
        console.error(err);
        res.status(402).end();
        return;
      }
      res.status(200).send();
    });
  }
  else if(fileType=="csv"){
    collection.find().project({_id:0,CAN_Id:1,Timestamp:1,raw:1}).sort({Timestamp:1, CAN_Id:1}).forEach(function(element){
      var string = "";
      string+=element.CAN_Id.toString(16);
      string+=",";
      string+=element.Timestamp.toString(19);
      string+=",";
      for(let data of element.raw){
        string+=data.toString(16);
        string+=","
      }
      string+="\r\n";
      res.write(string);
    },function(err){
      if(err){
        console.error(err);
        res.status(402).end();
        return;
      }
      res.status(200).send();
      console.log("Download of data complete");
    });
  }
}
export function setActive(callback) {
    activeCallback = callback;
}
export function deleteCollection(req,res){
    var name = req.params.collection;
    var collection = database.collection(name);
    var activeCollection = activeCallback();
    if(!collection) {
        res.sendStatus(404);
        return;
    }
    if(collection.collectionName == activeCollection.collectionName){
        res.status(401).send("can't delete active collection");
        return;
    }
    collection.drop();
    res.sendStatus(200);
}
export function printData(req,res){
    var start;
    var end;
    var name = req.params.collection;
    if(req.query.start) start = parseInt(req.query.start);
    if(req.query.end) end = parseInt(req.query.end);
    var collection = database.collection(name);
    if((start||start==0)&&end)collection.find().project({_id:0}).sort({Timestamp:1, CAN_Id:1}).skip(start).limit(end-start).toArray(function(err,elements)
    {
        if(err) {
            console.error(err);
            res.status(404);
        }
        console.log("Sent "+elements.length+" elements from db");
        res.status(200).send(elements);
    });
    else{
        collection.find().project({_id:0}).sort({Timestamp:1, CAN_Id:1}).toArray(function(err, elements) {
            if(err){
                console.error(err);
                res.status(404);
            }
            res.status(200).send(elements);
    });
    }
}