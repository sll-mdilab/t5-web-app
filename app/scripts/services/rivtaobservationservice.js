/**
 * @ngdoc service
 * @name fhirWebApp.rivtaObservationService
 * @description
 * # rivtaObservationService
 * Factory in the fhirWebApp.
 */
(function () {
  'use strict';
  angular.module('fhirWebApp')
    .factory('rivtaObservationService', _rivtaObservationService);

  _rivtaObservationService.$inject = ['$http', 'x2js', 'fhirObservation'];

  function _rivtaObservationService($http, x2js, fhirObservation) {

    var vm = {};

    vm.baseUrl = 'http://10.0.1.39:8989/';

    // Public API
    return {
      getObservation: getObservation
    };

    function getObservation(patientId, code, start, end) {
      if (!end){
        end = (new Date()).toISOString();
      }
      var url = vm.baseUrl + 'vp/clinicalprocess/healthcond/basic/GetObservations/1/rivtabp21';

      // build SOAP request
      var env = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:riv:itintegration:registry:1" xmlns:urn1="urn:riv:clinicalprocess:healthcond:basic:GetObservationsResponder:1" xmlns:urn2="urn:riv:clinicalprocess:healthcond:basic:1">\n' +
        '  <soapenv:Header>\n' +
        '     <urn:LogicalAddress>HSA-VKK123</urn:LogicalAddress>\n' +
        '  </soapenv:Header>\n' +
        '  <soapenv:Body>\n' +
        '     <urn1:GetObservations>\n' +
        '        <urn1:patientId>\n' +
        '           <urn2:root>{PATIENT_ID}</urn2:root>\n' +
        '        </urn1:patientId>\n' +
        '        <urn1:time>\n' +
        '           <urn2:start>{START}</urn2:start>\n' +
        '           <urn2:end>{END}</urn2:end>\n' +
        '        </urn1:time>\n' +
        '        <urn1:observationType>\n' +
        '           <urn2:code>{CODE}</urn2:code>\n' +
        '        </urn1:observationType>\n' +
        '     </urn1:GetObservations>\n' +
        '  </soapenv:Body>\n' +
        '</soapenv:Envelope>';

      env = env.replace('{PATIENT_ID}', patientId);
      env = env.replace('{CODE}', code);
      env = env.replace('{START}', start);
      env = env.replace('{END}', end);

      return $http({
        method: 'POST',
        url: url,
        data: env,
        headers: {'Content-Type': 'application/xml'},
        transformResponse: rivtaToFhir
      }).then(function (response) {
        return response.data;
      });
    }

    function rivtaToFhir(data) {
      var json = rivtaXmlToJson(data);
      var fhir = rivtaJsonToFhir(json);
      return fhir;
    }

    function rivtaXmlToJson(data) {
      var json = x2js.xml_str2json(data); // jshint ignore:line
      return json;
    }

    function rivtaJsonToFhir(rivtaJson) {
      var fhir = fhirObservation.instantiateEmptyObservation();

      var emptyEntry = angular.copy(fhir.entry[0]);

      angular.forEach(rivtaJson.Envelope.Body.GetObservationsResponse.observationGroup.observation, function (obs, i) {
        var newEntry = angular.copy(emptyEntry);
        // Map to proper FHIR parameters
        newEntry.resource.valueQuantity.value = obs.value.pq.value.__text;
        newEntry.resource.valueQuantity.unit = obs.value.pq.unit.__text;
        newEntry.resource.code.coding[0].code = obs.type.code.__text;
        newEntry.resource.appliesDateTime = obs.registrationTime.__text;

        fhir.entry[i] = newEntry;
      });

      return fhir;
    }
  }
})();
