'use strict';

describe('Controller: OauthcallbackCtrl', function () {

  // load the controller's module
  beforeEach(module('fhirWebApp'));

  var OauthcallbackCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    OauthcallbackCtrl = $controller('OauthcallbackCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
