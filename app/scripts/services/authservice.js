'use strict';

/**
 * @ngdoc service
 * @name fhirWebApp.AuthService
 * @description
 * # AuthService
 * Factory in the fhirWebApp.
 */
angular.module('fhirWebApp')
  .factory('AuthService', ['$http', '$q', 'Session', function ($http, $q, Session) {
    var authService = {};

    authService.login = function (userId) {
      // This is where a new Session is created and the user details are set.

      return $q(function(resolve, reject) {
       var userEntry = {
          "id": "1",
          "user": {
            "id": userId,
            "role": "nurse",
            "password": "",
            "name":"test",
            "profileURL": "db/images/female-avatar-1.png"
          }};
          console.log('Creating session, userId = ' + userId);
        Session.create(userId, userEntry.user.role);
        resolve(userEntry.user);
      });
    };

    authService.isAuthenticated = function () {
      return !!Session.userId;
    };

    authService.isAuthorized = function (authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (authService.isAuthenticated() &&
      authorizedRoles.indexOf(Session.userRole) !== -1);
    };

    return authService;
  }]);
