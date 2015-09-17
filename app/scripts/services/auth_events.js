'use strict';

/**
 * @ngdoc service
 * @name fhirWebApp.AUTH_EVENTS
 * @description
 * # AUTH_EVENTS
 * Constant in the fhirWebApp.
 */
angular.module('fhirWebApp')
  .constant('AUTH_EVENTS',{
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  });
