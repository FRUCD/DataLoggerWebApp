var express = require('express');
var router = express.Router();
var controller = require('./controller.js');
router.get('/collections',controller.list);
router.get('/collections/:collection',controller.printData);
router.get('/collections/:collection/download/:fileType',controller.download);
module.exports = router;
