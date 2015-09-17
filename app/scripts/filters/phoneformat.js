'use strict';

/**
 * @ngdoc filter
 * @name fhirWebApp.filter:phoneFormat
 * @function
 * @description
 * # phoneFormat
 * Filter in the fhirWebApp.
 */
angular.module('fhirWebApp')
  .filter('phoneFormat', function () {
    return function (input) {
      var output = '';
      if(input) {
        output = input.substr(0,3) + ' (0)' + input.substr(3,2) + '-' + input.substr(5,3) + ' ' + input.substr(8,2) + ' ' + input.substr(10);
      }
      return output;
    };
  });
