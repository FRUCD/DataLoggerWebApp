'use strict';

export default function routes($stateProvider) {
  'ngInject';
  $stateProvider
    .state('dashboard.display', {
      url: '/display',
      template: '<display></display>'
    });
}
