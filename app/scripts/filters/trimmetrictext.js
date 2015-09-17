'use strict';

/**
 * @ngdoc filter
 * @name fhirWebApp.filter:trimMetricText
 * @function
 * @description
 * # trimMetricText
 * Filter in the fhirWebApp.
 */
angular.module('fhirWebApp')
  .filter('trimMetricText', function () {
    return function (input) {
      if (input === undefined) {
        return undefined;
      }

      var index = input.indexOf('{');
      if (index >= 0) {
        return input.substring(0, index);
      } else {
        return input;
      }
    };
  });
