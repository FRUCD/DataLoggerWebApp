'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('dashboard.live', {
      url: '/live',
      parent: 'dashboard',
      template: '<live></live>'
    });
}
