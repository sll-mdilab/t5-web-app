'use strict';

/**
 * @ngdoc directive
 * @name fhirWebApp.directive:countTo
 * @description
 * # countTo
 * Directive that counts from one value to another in a specified duration.
 */
angular.module('fhirWebApp')
  .directive('counter', ['$interval', function ($interval) {
    return {
      restrict: 'E',
      template: '<span>{{current}}</span>',
      scope: {
        'ctrFrom': '=',
        'ctrTo': '=',
        'ctrDuration': '=' // This parameter should not be greater than the update freq of the from/to params
      },
      link: function (scope) {
        scope.ctrDuration = scope.ctrDuration || 250;
        var range = scope.ctrTo - scope.ctrFrom;
        if (range) {
          scope.current = scope.ctrFrom;
          var increment = scope.ctrTo > scope.ctrFrom ? 1 : -1;
          var stepTime = Math.abs(Math.floor(scope.ctrDuration / range));
          var timer = $interval(function () {
            scope.current += increment;
            if (scope.current >= scope.ctrTo) {
              $interval.cancel(timer);
            }
          }, stepTime);
        } else {
          scope.current = scope.ctrTo;
        }
      }
    };

  }]);
