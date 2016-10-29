'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('dashboard.bms', {
    url: '/bms',
    parent: 'dashboard',
    template: '<bms></bms>'
  });
}
