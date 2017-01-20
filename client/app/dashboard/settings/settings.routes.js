'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('dashboard.settings', {
    url: '/settings',
    parent: 'dashboard',
    template: '<settings></settings>'
  });
}
