import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './log.routes';

import c3 from 'c3';

export class LogController {
  /*@ngInject*/
  constructor() {
  }

  $onInit() {
  }
}

export default angular.module('dataLoggerWebApp.log', [uiRouter])
  .config(routing)
  .component('log', {
    template: require('./log.html'),
    controller: LogController
  })
  .name;
