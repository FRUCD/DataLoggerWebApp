'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('dashboard.curtis', {
    url: '/curtis',
    parent: 'dashboard',
    template: '<curtis></curtis>'
  });
}
