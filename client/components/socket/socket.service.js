'use strict';

import * as _ from 'lodash';
import angular from 'angular';
import io from 'socket.io-client';

function Socket(socketFactory) {
  'ngInject';
  // socket.io now auto-configures its connection when we ommit a connection url

  var ioSocket = io('',{
    path:'/socket.io-client'
  });

  var socket = socketFactory({
    ioSocket
  });

  return {
    socket,

    /**
     * Register listeners to sync an array with updates on a model
     *
     * Takes the model name that socket updates are sent from,
     * and an optional callback function after new items are updated.
     *
     * @param {String} modelName
     * @param {Function} cb
     */
    syncUpdates(modelName, cb) {
      cb = cb || angular.noop;

      /**
       * Syncs item creation/updates on 'model:newData'
       */
      socket.on(`${modelName}`, function(item) {
        cb(item);
      });
    },

    /**
     * Removes listeners for a models updates on the socket
     *
     * @param modelName
     */
    unsyncUpdates(modelName) {
      socket.removeAllListeners(`${modelName}`);
    }
  };
}

export default angular.module('dataLoggerWebApp.socket', [])
  .factory('socket', Socket)
  .name;
