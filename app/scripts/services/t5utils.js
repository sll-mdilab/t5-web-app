'use strict';

/**
 * @ngdoc service
 * @name fhirWebApp.t5Utils
 * @description
 * # t5Utils
 * Factory in the fhirWebApp.
 */
angular.module('fhirWebApp')
  .factory('t5Utils', function () {

    function mergeObjects(dst, objs, deep) {
      var h = dst.$$hashKey;

      for (var i = 0, ii = objs.length; i < ii; ++i) {
        var obj = objs[i];
        if (!isObject(obj) && !isFunction(obj)) {
          continue;
        }
        var keys = Object.keys(obj);
        for (var j = 0, jj = keys.length; j < jj; j++) {
          var key = keys[j];
          var src = obj[key];

          if (deep && isObject(src)) {
            if (!isObject(dst[key])) {
              dst[key] = isArray(src) ? [] : {};
            }
            mergeObjects(dst[key], [src], true);
          } else {
            dst[key] = src;
          }
        }
      }

      setHashKey(dst, h);
      return dst;
    }

    var isArray = Array.isArray;
    var slice = [].slice;

    /**
     * Set or clear the hashkey for an object.
     * @param obj object
     * @param h the hashkey (!truthy to delete the hashkey)
     */
    function setHashKey(obj, h) {
      if (h) {
        obj.$$hashKey = h;
      } else {
        delete obj.$$hashKey;
      }
    }

    function isObject(value) {
      return value !== null && typeof value === 'object';
    }

    function isFunction(value) {
      return typeof value === 'function';
    }

    return {
      /**
       * From AngularJS v1.4: https://docs.angularjs.org/api/ng/function/angular.merge
       *
       * Was implemented prior to using AngularJS v1.4
       *
       * @param dst
       * @returns {*}
       */
      deepMerge: function (dst) {
        return mergeObjects(dst, slice.call(arguments, 1), true);
      },
      containsIgnoreCase: function (aStr, otherStr) {
        return aStr.toUpperCase().indexOf(otherStr.toUpperCase()) >= 0;
      }
    };
  });
