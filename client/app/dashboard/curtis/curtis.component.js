import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './curtis.routes';

import c3 from 'c3';

export class CurtisController {
  /*@ngInject*/
  constructor() {
  }

  $onInit() {
  }
}

export default angular.module('dataLoggerWebApp.curtis', [uiRouter])
  .config(routing)
  .component('curtis', {
    template: require('./curtis.html'),
    controller: CurtisController
  })
  .name;
