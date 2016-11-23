'use strict';

export default function routes($stateProvider) {
  'ngInject';
  $stateProvider
    .state('dashboard.display', {
      url: '/display',
      parent: 'dashboard',
      template: '<display></display>'
    });
}
