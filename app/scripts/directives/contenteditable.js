'use strict';

/**
 * @ngdoc directive
 * @name fhirWebApp.directive:contenteditable
 * @description
 * # contenteditable
 */
angular.module('fhirWebApp')
  .directive('contenteditable', ['$sce', function($sce) {
    return {
      restrict: 'A', // only activate on element attribute
      require: 'ngModel', // get a hold of NgModelController
      link: function(scope, element, attrs, ngModel) {
        function read() {
          ngModel.$setViewValue(element.html());
        }
        ngModel.$render = function() {
          element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
        };
        element.bind('blur keyup change', function() {
          scope.$apply(read);
        });
      }
    };
  }]);
