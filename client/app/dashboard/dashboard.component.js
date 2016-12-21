import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './dashboard.routes';

import overview from './overview/overview.component';
import car from './car/car.component';
import bms from './bms/bms.component';
import database from './database/database.component';
import curtis from './curtis/curtis.component';
import status from './status/status.component';
import settings from './settings/settings.component';

export class DashboardController {
  /*@ngInject*/
  constructor($scope, $state) {
    $scope.$state = $state;
  }

  $onInit() {
  }
}

export default angular.module('dataLoggerWebAppApp.dashboard', [uiRouter, overview, database, status, settings, car, bms,curtis])
  .config(routing)
  .component('dashboard', {
    template: require('./dashboard.html'),
    controller: DashboardController
  })
  .name;
