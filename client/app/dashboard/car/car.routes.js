'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('dashboard.car', {
    url: '/car',
    parent: 'dashboard',
    template: '<car></car>'
  });
}
