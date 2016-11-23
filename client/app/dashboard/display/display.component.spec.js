'use strict';

describe('Component: DisplayComponent', function() {
  // load the controller's module
  beforeEach(module('dataLoggerWebAppApp.display'));

  var DisplayComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    DisplayComponent = $componentController('display', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
