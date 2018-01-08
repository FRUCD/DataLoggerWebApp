/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';
var Run = require('./api/run/routes.js');

export default function(app,parser,db) {
  // Insert routes below
  var run = new Run(db,parser);
  app.use('/api/run',run.router);
  var dbRoutes = require('./api/db/routes.js');
  console.log(run.callback);
  dbRoutes.bind(run.callback);
  app.use('/api/db',dbRoutes.router);
  app.use('/api/upload',require('./api/upload/routes.js'));
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);
  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
}
