const ParseDescriptor = require('../parse_descriptor.js');
var model = ParseDescriptor.model;
var Validator = require('../validator.js');

export function listDescriptor(req, res) {
    model.find({}, {_id: 0, CAN_Id: 1, PDO_Description: 1}, function(err, result) {
        if(err) {
            console.error(err);
            res.sendStatus(401);
            return;
        }
        console.log(result);
        res.send(result);
    });
}
export function getDescriptor(req, res) {
    model.findOne({CAN_Id: req.params.descriptor}, {_id: 0, "map.key": 0}, function(err, result) {
        if(err) {
            console.error(err);
            res.sendStatus(401);
            return;
        }
        res.send(result);
    });
}
export function updateDescriptor(req, res) {
    if(!req.body) {
        res.sendStatus(401);
        return;
    }
    var request = req.body;
    try {
        Validator(request);
        var set = new Object();
        var unset = new Object();
        set.CAN_Id = request.CAN_Id;
        set.PDO_Description = request.PDO_Description;
        var count;
        model.findOne({CAN_Id: req.params.descriptor}).select("map")
        .exec()
        .then(function(document) {
            if(document) {
                document = document.toObject();
                count = document.map.length;
                if(document.map.length > request.map.length) throw new Error("too few fields");
                for(var i = 0; i < count; i++) {
                    Object.keys(request.map[i]).forEach(function(key) {
                        if(key != 'key') set[`map.${i}.${key}`] = request.map[i][key];
                    });
                    if(request.map[i].dataType != "array") unset[`map.${i}.array`] = "";
                }
                console.log("set");
                console.log(set);
                var add = request.map.slice(count, request.map.length);
                console.log("add");
                console.log(add);
                model.findOneAndUpdate({CAN_Id: req.params.descriptor}, {$set: set, $unset: unset}, {upsert: false, new: true}, function(err, doc) {
                    if(err) {
                        console.error(err);
                        res.status(501).send("invalid update procedure");
                        return;
                    }
                    doc = doc.toObject();
                    model.findOneAndUpdate({CAN_Id: doc.CAN_Id}, {$addToSet: {map: {$each: add}}}, {upsert: true, new: true}, function(err, doc) {
                        if(err) {
                            console.error(err);
                            res.status(501).send("invalid update procedure");
                            return;
                        }
                        res.status(200).send(doc);
                    });
                });
            }
            else{
                model.create(request, function(err) {
                    if(err) {
                        console.log("error creating documents");
                        console.error(err);
                        return;
                    }
                    res.sendStatus(200);
                });
            }
        })
        .catch(function(err) {
            console.error(err);
        })
        .done();
    }
    catch(e){
        console.log(e);
        res.status(402).send("invalid formatting");
    }
}
export function deleteMap(req,res){
    if(req.query.offset && req.query.length && req.query.description && req.query.dataType) {
        console.log(req.query);
        var element = {offset: parseInt(req.query.offset),
            description:req.query.description,
            length: parseInt(req.query.length),
            dataType: req.query.dataType,
            key: {$exists: false}
        };
        console.log(element);
        model.find({CAN_Id: req.params.descriptor, map: {$elemMatch: element}}).select({map: 1, _id: 0})
        .exec()
        .then(function(doc) {
            //console.log("we're here");
            if(doc && doc.length > 0) {
                delete element.key;
                model.findOneAndUpdate({CAN_Id: req.params.descriptor}, {$pull: {map: element}}, {multi: false,upsert: false}, function(err, doc) {
                    if(err){
                        console.error(err);
                        res.status(501).send("invalid update procedure");
                        return;
                    }
                    res.status(200).send(doc);
                });
            }
            else {
                res.status(401).send("can't delete core mapping");
            }
        }, function(err) {
            if(err) console.error(err);
            res.status(501).send("invalid update procedure");
        });
        /**/
    }
    else {
        model.find({CAN_Id: req.params.descriptor, "map.key": {$exists: true}}).exec()
        .then(function(doc) {
            console.log(doc);
            if(!doc || (doc instanceof Array && doc.length == 0)) {
                model.remove({CAN_Id: req.params.descriptor}, function(err) {
                    if(err) {
                        console.log(err);
                        res.status(501).send("invalid delete procedure");
                        return;
                    }
                    res.sendStatus(200);
                });
            }
            else {
                res.status(401).send("can't delete core mapping");
            }
        }, function(err) {
            if(err) console.error(err);
            res.status(501).send("invalid delete procedure");
        });
    }
}
export function reset(req, res) {
    ParseDescriptor.reset(err => {
        if(err) {
            console.error(err);
            res.sendStatus(401);
            return;
        }
        res.sendStatus(200);
    });
}
