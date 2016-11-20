import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './dashboard.routes';

import overview from './overview/overview.component';
import car from './car/car.component';
import bms from './bms/bms.component';


export class DashboardController {
  /*@ngInject*/
  constructor($scope, $state) {
    $scope.$state = $state;
  }

  $onInit() {
  }
}

export default angular.module('dataLoggerWebAppApp.dashboard', [uiRouter, overview, car, bms])
  .config(routing)
  .component('dashboard', {
    template: require('./dashboard.html'),
    controller: DashboardController
  })
  .name;
