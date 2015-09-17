'use strict';

/**
 * @ngdoc service
 * @name fhirWebApp.DebugBackend
 * @description
 * # DebugBackend
 * Factory in the fhirWebApp.
 */
angular.module('fhirWebApp')
  .factory('DebugBackend', ['$timeout', '$http', function ($timeout, $http) {
    // Service logic
    var baseUrl =  'https://debug-backend.sll-mdilab.net/';
    var timeout = '15000';

    /**
     * Convert a device summary retrieved from backend to a convenient format
     * @param obj
     * @returns {{}}
     */
    var convertDevice = function (obj) {
      var rObj = {};
      rObj.entity = {
        identifier: obj.deviceId,
        displayName: obj.deviceId
      };
      rObj.messages = {
        success: obj.messageCount,
        failed: obj.errorMessageCount
      };
      return rObj;
    };

    /**
     * Convert a client summary retrieved from backend to a convenient format
     * @param obj
     * @returns {{}}
     */
    var convertClient = function (obj) {
      var rObj = {};
      rObj.entity = {
        identifier: obj.sessionId,
        displayName: obj.clientVersion
      };
      rObj.messages = {
        success: obj.messageCount,
        failed: obj.errorMessageCount
      };
      return rObj;
    };

    /**
     * A quick fix for replacing the Z in an ISO date string with -0000
     * @param isoDate
     * @returns {string}
     */
    function fromZToTimezoneOffset(isoDate) {
      return isoDate.slice(0, isoDate.length-1) + '-0000';
    }

    // Public API here
    return {
      /**
       * The status summary is an overview of the number of messages / requests sent from
       * devices / clients for a specific patient.
       * @param patientId Id number of the patient
       * @param isoStart Start timestamp in ISO format
       * @param isoEnd End timestamp in ISO format
       * @returns {*} Summary object
       */
      getStatusSummary: function (patientId, isoStart, isoEnd) {
        isoStart = fromZToTimezoneOffset(isoStart);
        isoEnd = fromZToTimezoneOffset(isoEnd);

        var url = baseUrl + 'patient/' + patientId + '/count?start=' + isoStart + '&end=' + isoEnd;
        return $http({
          method: 'GET',
          url: url,
          timeout: timeout
        }).then(function (response) {
          var rEntity = {};
          rEntity.devices = response.data.deviceStatusSummaries ? response.data.deviceStatusSummaries.map(convertDevice) : [];
          rEntity.clients = response.data.clientStatusSummaries ? response.data.clientStatusSummaries.map(convertClient) : [];
          return rEntity;
        });
      },
      /**
       * Retrieve the log messages from a specific device for a specific time interval
       * @param deviceId Id of the device
       * @param isoStart Start timestamp in ISO format
       * @param isoEnd End timestamp in ISO format
       * @returns {*} Object containing log messages
       */
      getDeviceLogMessages: function (deviceId, isoStart, isoEnd) {
        var url = baseUrl + 'device/' + deviceId + '/log';

        isoStart = fromZToTimezoneOffset(isoStart);
        isoEnd = fromZToTimezoneOffset(isoEnd);
        return $http({
          method: 'GET',
          url: url,
          params: {
            start: isoStart,
            end: isoEnd
          }
        }).then(function (response) {
          return response.data;
        });
      },
      /**
       * Retrieve the log messages from a specific session for a specific time interval
       * @param sessionId Id of the session
       * @param isoStart Start timestamp in ISO format
       * @param isoEnd End timestamp in ISO format
       * @returns {*} Object containing log messages
       */
      getClientLogMessages: function (sessionId, isoStart, isoEnd) {
        var url = baseUrl + 'session/' + sessionId + '/log';

        isoStart = fromZToTimezoneOffset(isoStart);
        isoEnd = fromZToTimezoneOffset(isoEnd);
        return $http({
          method: 'GET',
          url: url,
          params: {
            start: isoStart,
            end: isoEnd
          }
        }).then(function (response) {
          return response.data;
        });
      }
    };
  }]);
