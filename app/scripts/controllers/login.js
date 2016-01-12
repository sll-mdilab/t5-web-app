'use strict';

/**
 * @ngdoc function
 * @name fhirWebApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the fhirWebApp
 */
angular.module('fhirWebApp')
  .controller('LoginCtrl', ['$scope', '$rootScope', '$location', 'AUTH_EVENTS', 'AuthService', function ($scope, $rootScope, $location, AUTH_EVENTS, AuthService) {
    $scope.credentials = {
      username: '',
      password: ''
    };
    $scope.login = function (credentials) {
      AuthService.login(credentials).then(function (user) {
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        $scope.setCurrentUser(user);
        // Default path on login
        $location.$$search = {};
        $location.path('/pid');
      }, function () {
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      });
    };
  }]);
