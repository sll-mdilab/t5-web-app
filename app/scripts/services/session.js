'use strict';

/**
 * @ngdoc service
 * @name fhirWebApp.Session
 * @description
 * # Session
 * Service in the fhirWebApp.
 */
angular.module('fhirWebApp')
  .service('Session', ['$rootScope', 'rfc4122', function ($rootScope, rfc4122) {
    this.create = function (userId, userRole) {
      this.id = rfc4122.v4();
      this.userId = userId;
      this.userRole = userRole;
      $rootScope.$broadcast('session-created', {sessionId: this.id});
    };
    this.destroy = function () {
      this.id = null;
      this.userId = null;
      this.userRole = null;
    };
  }]);
