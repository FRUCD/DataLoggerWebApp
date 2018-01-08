'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('dashboard.log', {
    url: '/log',
    parent: 'dashboard',
    template: '<log></log>'
  });
}
