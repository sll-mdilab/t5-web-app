'use strict';

/**
 * @ngdoc function
 * @name fhirWebApp.controller:OauthcallbackCtrl
 * @description
 * # OauthcallbackCtrl
 * Controller of the fhirWebApp
 */
angular.module('fhirWebApp')
  .controller('OauthcallbackCtrl',['$scope', '$rootScope', '$location', '$routeParams', 'fhirConfig', 'AuthService', 'AUTH_EVENTS', 'fhirOauth', function ($scope, $rootScope, $location, $routeParams, fhirConfig, authService, AUTH_EVENTS, fhirOauth) {

    $scope.statustext = 'Fetching token...';

    fhirOauth.ready(function(currentPractitioner) {
        authService.login(currentPractitioner.id).then(function (user) {
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            $scope.setCurrentUser(currentPractitioner.id);
            $scope.setCurrentPractitioner(currentPractitioner);

            console.log('Login sequence completed.');

            $location.path('/pid');

            if(!$scope.$$phase) {
                $scope.$apply();
            }
        });
    }, function(message) {
        $scope.statustext = 'Error: ' + message;
    });
  }]);
