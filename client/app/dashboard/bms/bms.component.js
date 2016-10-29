import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './bms.routes';

export class CarController {
  /*@ngInject*/
  constructor() {
  }

  $onInit() {
  }
}

export default angular.module('dataLoggerWebApp.bms', [uiRouter])
  .config(routing)
  .component('bms', {
    template: require('./bms.html'),
    controller: CarController
  })
  .name;
