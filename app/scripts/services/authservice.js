'use strict';

/**
 * @ngdoc service
 * @name fhirWebApp.AuthService
 * @description
 * # AuthService
 * Factory in the fhirWebApp.
 */
angular.module('fhirWebApp')
  .factory('AuthService', ['$http', 'Session', function ($http, Session) {
    var authService = {};

    authService.login = function (credentials) {
      // Make an http request to login with credentials to simulate a server side authorization service.
      // This is where a new Session is created and the user details are set.
      return $http({
          url:'db/user/user.json', method:'GET'}
      ).then(function(res){
          for(var entryIdx in res.data){
            var entry = res.data[entryIdx];
            // Skip password check for ease
            if(entry.user.id === credentials.username){
              Session.create(entry.user.id, entry.user.role);
              return entry.user;
            }
          }
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
