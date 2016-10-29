import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './dashboard.routes';

export class DashboardController {
  /*@ngInject*/
  constructor($http, $scope, socket) {
    //this.$http = $http;
    //this.socket = socket;
    //TODO: Cleanup and add relevant stuff
    /*$scope.$on('$destroy', function() {
      socket.unsyncUpdates('thing');
    });*/
  }

  $onInit() {
    //TODO: Cleanup and add relevant stuff
    /*this.$http.get('/api/things')
      .then(response => {
        this.awesomeThings = response.data;
        this.socket.syncUpdates('thing', this.awesomeThings);
      });*/
  }
}

export default angular.module('dataLoggerWebAppApp.dashboard', [uiRouter])
  .config(routing)
  .component('dashboard', {
    template: require('./dashboard.html'),
    controller: DashboardController
  })
  .name;
