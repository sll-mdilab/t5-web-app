'use strict';

describe('Service: mdcCodeMap', function () {

  // load the service's module
  beforeEach(module('fhirWebApp'));

  // instantiate service
  var mdcCodeMap;
  beforeEach(inject(function (_mdcCodeMap_) {
    mdcCodeMap = _mdcCodeMap_;
  }));

  it('should do something', function () {
    expect(!!mdcCodeMap).toBe(true);
  });

});
