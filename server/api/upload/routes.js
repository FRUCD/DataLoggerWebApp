var express = require('express');
var Controller = require('./controller.js');
var router = express.Router();
var controller = new Controller();
router.get('/',controller.index);
module.exports = router;