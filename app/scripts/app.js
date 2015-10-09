'use strict';

angular
  .module('fhirWebApp', [
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.grid',
    'ui.grid.selection',
    'ui.grid.edit',
    'ui.grid.autoResize',
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker',
    'angularMoment',
    'angularFhirResources',
    'pageslide-directive',
    'uuid',
    'cb.x2js'
  ])
  .config(function ($routeProvider, USER_ROLES, fhirConfigProvider, fhirAPI) {
    $routeProvider
      .when('/', {
        redirectTo: '/login'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        title: 'Login | Innovationsplatsen'
      })
      .when('/pid', {
        templateUrl: 'views/pid.html',
        controller: 'PidCtrl',
        title:'Patientidentifiering | Innovationsplatsen',
        data: {
          authorizedRoles: [USER_ROLES.admin, USER_ROLES.doctor, USER_ROLES.nurse]
        }
      })
      .when('/preflight', {
        templateUrl: 'views/preflight.html',
        controller: 'PreflightCtrl',
        title: 'Pre Flight | Innovationsplatsen',
        data: {
          authorizedRoles: [USER_ROLES.admin, USER_ROLES.doctor, USER_ROLES.nurse]
        }
      })
      .when('/stream', {
        templateUrl: 'views/stream.html',
        controller: 'StreamCtrl',
        title: 'Live Stream | Innovationsplatsen',
        data: {
          authorizedRoles: [USER_ROLES.admin, USER_ROLES.doctor, USER_ROLES.nurse]
        }
      })
      .when('/debug', {
        templateUrl: 'views/debug.html',
        controller: 'DebugCtrl',
        title:'Felsökning | Innovationsplatsen',
        data: {
          authorizedRoles: [USER_ROLES.admin, USER_ROLES.doctor, USER_ROLES.nurse]
        }
      })
      .when('/brokering', {
        templateUrl: 'views/brokering.html',
        controller: 'HL7BrokeringManagementCtrl',
        controllerAs: 'vm',
        title:'Vidarebefordring | Innovationsplatsen',
        data: {
          authorizedRoles: [USER_ROLES.admin, USER_ROLES.doctor, USER_ROLES.nurse]
        }
      })
      .otherwise({
        redirectTo: '/'
      });

    // Specify T5-PoC credentials
    fhirConfigProvider.setAPICredentials(fhirAPI.apiUser, fhirAPI.apiKey);
    fhirConfigProvider.setBackendURL(fhirAPI.url);
  })
  .run(function($rootScope, $location, AUTH_EVENTS, AuthService, amMoment, fhirConfig){
    $rootScope.$on('$routeChangeStart', function(event, next){
      if(next.data !== undefined){
        var authorizedRoles = next.data.authorizedRoles;
        if(!AuthService.isAuthorized(authorizedRoles)){
          event.preventDefault();
          if(AuthService.isAuthenticated()){
            // user is not allowed
            $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
            $location.path('/pid');
          } else {
            // user is not logged in
            $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            $location.path('/login');
          }
        }
      }
    });

    $rootScope.$on('$routeChangeSuccess', function (event, current) {
      if (current.hasOwnProperty('$$route')) {
        $rootScope.title = current.$$route.title;
        // Keep track of what app is requesting information from T5-PoC
        fhirConfig.setCustomHeader('Client-Version', $rootScope.title);
      }
    });

    $rootScope.$on('session-created', function(event, session){
      // Keep track of what app is requesting information from T5-PoC
      fhirConfig.setCustomHeader('Session-Id', session.sessionId);
    });

    amMoment.changeLocale('sv');
  });
