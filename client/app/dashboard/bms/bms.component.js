import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './bms.routes';

import c3 from 'c3';

export class BMSController {
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
    controller: BMSController
  })
  .name;
