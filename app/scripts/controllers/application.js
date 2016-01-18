'use strict';

/**
 * @ngdoc function
 * @name fhirWebApp.controller:ApplicationCtrl
 * @description
 * # ApplicationCtrl
 * Controller of the fhirWebApp
 */
angular.module('fhirWebApp')
  .controller('ApplicationCtrl', ['$rootScope', '$scope', '$location', 'USER_ROLES', 'AUTH_EVENTS', 'AuthService', 'Session', function ($rootScope, $scope, $location, USER_ROLES, AUTH_EVENTS, AuthService, Session) {
    $scope.currentUser = null;
    $scope.currentPractitioner = null;
    $scope.userRoles = USER_ROLES;
    $scope.isAuthorized = AuthService.isAuthorized;

    $scope.setCurrentUser = function (user) {
      $scope.currentUser = user;
    };

    $scope.getCurrentUser = function () {
      return $scope.currentUser;
    };

    $scope.setCurrentPractitioner = function (practitioner) {
      $scope.currentPractitioner = practitioner;
    };

    $scope.getCurrentPractitioner = function () {
      return $scope.currentPractitioner;
    };

    $scope.logout = function () {
      $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
      Session.destroy();
      $scope.setCurrentUser(undefined);
      $location.path('/');
    };
  }]);
