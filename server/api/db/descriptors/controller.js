var model = require('../parse_descriptor.js').model;
var Validator = require('../validator.js');
export function listDescriptor(req,res){
    model.find({},{_id:0,CAN_Id:1, PDO_Description:1},function(err,result){
        if(err) {
            console.error(err);
            res.sendStatus(401);
            return;
        }
        console.log(result);
        res.send(result);
    });
}
export function getDescriptor(req,res){
    model.findOne({CAN_Id:req.params.descriptor},{_id:0,"map.key":0},function(err,result){
        if(err){
            console.error(err);
            res.sendStatus(401);
            return;
        }
        res.send(result);
    });
}
export function updateDescriptor(req,res){
    if(!req.body){
        res.sendStatus(401);
        return;
    }
    var doc = req.body;
    console.log(doc);
    try{
        Validator(doc);
        model.findOneAndUpdate({CAN_Id:req.params.descriptor},{$set:{CAN_Id:doc.CAN_Id,PDO_Description:doc.PDO_Description},$addToSet:{map:{$each:doc.map}}},{upsert:true,new:true},function(err,doc){
            if(err) {
                console.error(err);
                res.status(501).send("invalid update procedure");
                return;
            }
            res.sendStatus(200);
        });
    }
    catch(e){
        console.log(e);
        res.status(402).send("invalid formatting");
    }
}