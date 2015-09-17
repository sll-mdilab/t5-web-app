'use strict';

/**
 * @ngdoc directive
 * @name fhirWebApp.directive:DebugTicket
 * @description
 * # DebugTicket
 */
angular.module('fhirWebApp')
  .directive('debugTicket', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/debugtickettemplate.html',
      scope: {
        ticketDetails: '=ticketData',
        prevTicketDetails: '=prevTicketData',
        downloadButtonClick: '=',
        infoButtonClick: '=',
        fileButtonClick: '=',
        ctrDuration: '='
      },
      link: function (scope) {
        scope.loadingIndicator = true;


        scope.download = function () {
          scope.downloading = true;
          scope.downloadButtonClick(scope.ticketDetails).then(function(){
            scope.downloading = false;
          });
        };

        scope.file = function () {
          scope.loadingIndicator = true;
          scope.fileButtonClick(scope.ticketDetails).then(function () {
              scope.loadingIndicator = false;
          });
        };

        scope.info = function () {
          scope.loadingIndicator = true;
          scope.infoButtonClick(scope.ticketDetails).then(function () {
            scope.loadingIndicator = false;
          });
        };
      }
    };
  });
