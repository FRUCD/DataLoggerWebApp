'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './live.routes';

export class LiveComponent {
  /*@ngInject*/
  constructor() {
  }
<<<<<<< d58588c18cdeffce6cb1b3759ab4f916a26723aa
=======
  $onInit(){
    
  }
>>>>>>> revert to the old columns implementation
}

export default angular.module('dataLoggerWebApp.live', [uiRouter])
  .config(routes)
  .component('live', {
    template: require('./live.html'),
    controller: LiveComponent
  })
  .name;
