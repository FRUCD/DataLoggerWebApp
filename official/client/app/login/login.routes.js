'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('login', {
    url: '/',
    template: '<login></login>'
  });
}
