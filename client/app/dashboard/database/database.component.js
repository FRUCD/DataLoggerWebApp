import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './database.routes';

import c3 from 'c3';

export class CarController {
  /*@ngInject*/
  constructor() {
  }

  $onInit() {
  }
}

export default angular.module('dataLoggerWebApp.database', [uiRouter])
  .config(routing)
  .component('car', {
    template: require('./car.html'),
    controller: CarController
  })
  .name;
