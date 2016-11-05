'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('dashboard.car', {
    url: '/database',
    parent: 'dashboard',
    template: '<database></database>'
  });
}
