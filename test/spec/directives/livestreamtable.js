'use strict';

describe('Directive: liveStreamTable', function () {

  // load the directive's module
  beforeEach(module('fhirWebApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<live-stream-table></live-stream-table>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the liveStreamTable directive');
  }));
});
