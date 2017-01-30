var converter = require('csvtojson');
module.exports = function index(req,res){
    var file = req.file;
    console.log(file);
    res.sendStatus(200);
}