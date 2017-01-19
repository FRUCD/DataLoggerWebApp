'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './live.routes';

export class LiveComponent {
  /*@ngInject*/
  constructor() {
  }
  $onInit(){
    
  }
}

export default angular.module('dataLoggerWebApp.live', [uiRouter])
  .config(routes)
  .component('live', {
    template: require('./live.html'),
    controller: LiveComponent
  })
  .name;
