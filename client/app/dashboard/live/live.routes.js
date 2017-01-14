'use strict';

export default function routes($stateProvider) {
  'ngInject';
  $stateProvider
    .state('dashboard.live', {
      url: '/live',
      parent: 'dashboard',
      template: '<live></live>'
    });
}
