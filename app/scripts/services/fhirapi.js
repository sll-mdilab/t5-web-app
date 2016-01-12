'use strict';

/**
 * @ngdoc service
 * @name fhirWebApp.fhirAPI
 * @description
 * # fhirAPI
 * Constant in the fhirWebApp.
 */
angular.module('fhirWebApp')
  .constant('fhirAPI', {
    // Insert your API credentials or OAuth server details here
    apiUser: 'YOUR_API_USERNAME',
    apiKey: 'YOUR_API_KEY',
    url: 'YOUR_API_BASE_URL',
    oauthClientId: 'YOUR_CLIENT_ID',
    oauthRedirectUri: 'YOUR_REDIRECT_URI'
  });