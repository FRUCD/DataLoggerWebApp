'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './display.routes';

export class DisplayComponent {
  /*@ngInject*/
  constructor() {
  }
}

export default angular.module('dataLoggerWebApp.display', [uiRouter])
  .config(routes)
  .component('display', {
    template: require('./display.html'),
    controller: DisplayComponent
  })
  .name;
