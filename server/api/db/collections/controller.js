var MongoClient = require('mongodb').MongoClient;
var database;
function sort(collections){
  quicksort(collections,0,collections.length-1);
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

function transform(object){
  if(object instanceof Array){
    if(object.length>0){
      if(typeof(object[0])==='boolean'){
        var out = 0;
        out |= (object[object.length-1] ? 1 : 0);
        for(var i=object.length-2;i>0;i--){
          out = out << 1;
          out |= (object[i] ? 1 : 0);
        }
        return out;
      }
      else{
        return object;
      }
    }
  }
  if(object instanceof Object){
    //generics object
    return transform(object.value);
  }
  return object;
}

MongoClient.connect('mongodb://localhost/data',function(err,db){
  if(err){
    console.error(err);
    return;
  }
  database = db;
});

export function list(req,res){
  database.listCollections({name:/[1-12].[1-31].[1-9]+/}).toArray(function (err,array) {
    if(err)console.error(err);
    var collections = [];
    array.forEach(function(value,index,array){
      collections.push(value.name);
    });
    sort(collections);
    console.log(collections);
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
  collection.find().project({_id:0}).forEach(function(element)
  {
    if(fileType=="json"){
      res.write(JSON.stringify(element)+'\r\n');
    }
  },function(err){
    if(err){
      console.error(err);
      res.status(402).end();
      return;
    }
    res.status(200).send();
  });
}
export function printData(req,res){
  var name = req.params.collection;
  var start = parseInt(req.query.start) || 0;
  var end = parseInt(req.query.end) || 10;
  var collection = database.collection(name);
  collection.find().skip(start).limit(end-start).toArray(function(err,elements)
  {
    if(err){
      console.error(err);
      res.status(404);
    }
    for(var i=0;i<elements.length;i++){
      elements[i].data = [];
      for(var key in elements[i]){
        if(key!="CAN_Id"&&key!="Timestamp"&&key!="_id"&&key!="data"&&key!="generics") {
          elements[i].data.push(transform(elements[i][key]));
          delete elements[i][key];
        }
        else if(key == "generics"){
          for(var element of elements[i][key]){
            var transformed = transform(element);
            elements[i].data.push(transformed);
          }
        }
      }
      delete elements[i]._id;
    }
    console.log(elements);
    res.status(200).send(elements);
  });
}