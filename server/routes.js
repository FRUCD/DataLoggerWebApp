/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';
var dbStream = require('./db/dbStream.js');
var database;
export default function(app,parser) {
  // Insert routes below
  app.use('/api/things', require('./api/thing'));
  app.use('/api/db',require('./api/db/routes.js'));
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);
  app.get('/start',function(req,res){
    database = new dbStream();
    parser.pipe(database);
    res.sendStatus(200);
  });
  app.get('/stop',function(req,res){
    parser.unpipe();
    res.sendStatus(200);
  });
  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
}
