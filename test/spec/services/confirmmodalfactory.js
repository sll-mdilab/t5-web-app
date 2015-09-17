'use strict';

describe('Service: confirmModalFactory', function () {

  // load the service's module
  beforeEach(module('fhirWebApp'));

  // instantiate service
  var confirmModalFactory;
  beforeEach(inject(function (_confirmModalFactory_) {
    confirmModalFactory = _confirmModalFactory_;
  }));

  it('should do something', function () {
    expect(!!confirmModalFactory).toBe(true);
  });

});
