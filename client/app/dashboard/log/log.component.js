import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './log.routes';

import c3 from 'c3';

export class LogController {
  /*@ngInject*/
  constructor($scope, $timeout, socket) {
    this.socket = socket;
    this.scope = $scope;
    $scope.messages = [];
  }

  $onInit() {
    this.socket.syncUpdates('log', function (data) {
      if (data) {
        $scope.messages.splice(0, 0, data);
        if($scope.messages.length > 100)
          $scope.messages.pop();
      }
    }.bind(this));
  }
}

export default angular.module('dataLoggerWebApp.log', [uiRouter])
  .config(routing)
  .component('log', {
    template: require('./log.html'),
    controller: LogController
  })
  .name;
