import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './dashboard.routes';

import overview from './overview/overview.component';


export class DashboardController {
  /*@ngInject*/
  constructor($scope, $state) {
    $scope.$state = $state;
  }

  $onInit() {
  }
}

export default angular.module('dataLoggerWebAppApp.dashboard', [uiRouter, overview])
  .config(routing)
  .component('dashboard', {
    template: require('./dashboard.html'),
    controller: DashboardController
  })
  .name;
