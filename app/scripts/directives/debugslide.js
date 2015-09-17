'use strict';

/**
 * @ngdoc directive
 * @name fhirWebApp.directive:debugSlide
 * @description
 * # debugSlide
 */
angular.module('fhirWebApp')
  .directive('debugSlide', ['$timeout', function ($timeout) {
    return {
      restrict: 'E',
      scope: {
        dbgTemplateUrl: '=',
        dbgShowSlide: '=',
        dbgSlideModel: '=',
        dbgClose: '=',
        dbgScrollDuration: '='
      },
      templateUrl: function (tElement, tAttrs) {
        return tAttrs.dbgTemplateUrl;
      },
      link: function (scope) {
        scope.dbgMsgs = [];
        scope.lineBufferSize = 30;
        scope.dbgScrollDuration = scope.dbgScrollDuration || 250;

        // `tail -f` effect
        // Using ngAnimate resulted in unwanted behaviour with temporary debug-ticket duplicates.
        // Therefore the animation has been manually implemented.
        function scrollToBottom(duration) {
          if (duration <= 0) {
            return;
          }
          var elements = angular.element('.log-container');
          if (elements.get(0)) {
            var element = elements.get(0);
            var difference = element.scrollHeight - element.scrollTop;
            var perTick = difference / duration * 10;
            $timeout(function () {
              elements.scrollTop(element.scrollTop + perTick);
              scrollToBottom(duration - 10);
            }, 10);
          }
        }

        // When dbgSlideModel changes
        scope.$watch('dbgSlideModel', function (newVal) {
          if (newVal && newVal.log && scope.dbgShowSlide) {
            // Add messages to the buffer to enable animation
            var newMsgs = newVal.log.messageLog.split('\n');
            Array.prototype.push.apply(scope.dbgMsgs, newMsgs);
            scrollToBottom(scope.dbgScrollDuration);

            // Only keep the maximum number of lines
            $timeout(function(){
              scope.dbgMsgs = scope.dbgMsgs.slice(scope.dbgMsgs.length - scope.lineBufferSize, scope.dbgMsgs.length);
            }, scope.dbgScrollDuration + 100); // Small offset to the duration to ensure no visual defects
          }
        });
      }
    };
  }]);
