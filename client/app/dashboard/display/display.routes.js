'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('dashboard.display', {
      url: '/display',
      parent: 'dashboard',
      template: '<display></display>'
    });
}
