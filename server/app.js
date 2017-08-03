/**
 * Main application file
 */

'use strict';

import express from 'express';
import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import config from './config/environment';
import http from 'http';
import logger from './console/log';
if(process.env.NODE_ENV != "test") {
    console.log = logger.log;
    console.error = logger.error;
}
// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1); // eslint-disable-line no-process-exit
});

// Populate databases with sample data
// Setup server
var app = express();
var server = http.createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: config.env !== 'production',
  path: '/socket.io-client'
});
var Serial = require('./serial/serial.js');
var Parser = require('./serial/dynamicParser.js');
var dbStream = require('./db/dbStream.js');
var arduinoListener;
var parser = new Parser();
var database = new dbStream();
var webSource = socketio.of('/src');
webSource.on('connect', function(socket) {
    console.log("Source connected: ");
    arduinoListener.unpipe(parser);
    arduinoListener.disconnect();
    socket.on('data', function(data) {
        parser.write(data);
    });
});
parser.on('data', function(data) {
    switch (data.CAN_Id) {
    case 1574:
    case 512:
    case 513:
        socketio.emit("car", data);
        break;
    case 1160:
        socketio.emit("temp", data);
        break;
    case 392:
    case 904:
        socketio.emit("bms", data);
        break;
    default:
        socketio.emit("data", data);
    }
});
require('./config/socketio').default(socketio);
require('./config/express').default(app);
require('./routes').default(app, parser, database);
// Start server
function startServer() {
    app.angularFullstack = server.listen(config.port, config.ip, function() {
        console.log(`Express server listening on ${config.port}, in ${app.get('env')} mode`);
    });
}

setImmediate(startServer);
setImmediate(function() {
    arduinoListener = new Serial();
    arduinoListener.pipe(parser).pipe(database);
});
// Expose app
exports = module.exports = app;
