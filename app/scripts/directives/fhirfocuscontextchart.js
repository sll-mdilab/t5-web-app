'use strict';

/**
 * @ngdoc directive
 * @name fhirWebApp.directive:fhirFocusContextChart
 * @description
 * # fhirFocusContextChart
 * Uses the nvd3 focus context chart to easily access the brush functionality in the context view.
 * The focus view is not displayed.
 */
angular.module('fhirWebApp')
  .directive('fhirFocusContextChart', function () {

    return {
      restrict: 'E',
      scope: {
        data: '=',
        config: '='
      },
      link: function ($scope, $element) {
        nv.addGraph(function () {
          $scope.chart = nv.models.lineWithFocusChart();

          configureAxes($scope);
          $scope.chart.pointSize(10.0);
          $scope.chart.interpolate('linear');
          $scope.chart.focusHeight($scope.config.height);

          $scope.svg = d3.select($element[0]);
          $scope.svg = $scope.svg.append('svg')
            .attr('height', $scope.config.height);

          // When the brush is changed, make the brush extent accessible in the parent scope.
          $scope.chart.dispatch.brush.on('brush', function () {
            $scope.$parent.brushExtent = $scope.chart.brushExtent();
          });

          nv.utils.windowResize($scope.updateChart);
          return $scope.chart;
        });

        function configureAxes($scope) {
          $scope.chart.xAxis
            .tickFormat(function (d) {
              return d3.time.format('%X')(new Date(d));
            });

          $scope.chart.x2Axis
            .tickFormat(function (d) {
              return d3.time.format('%X')(new Date(d));
            });

          $scope.chart.yAxis
            .tickFormat(d3.format(',.0f'));

          $scope.chart.y2Axis
            .tickFormat(d3.format(',.0f'));
        }

        $scope.updateChart = function () {
          $scope.svg
            .datum($scope.data)
            .call($scope.chart);

          // Remove focus view and tooltip
          d3.select('.nv-focus').remove();
          d3.select('.nvtooltip').remove();

          var legend = d3.select('.nv-legend').node();
          var legendHeight = 30;

          // Get the bounding box height to calculate the extra space needed for stacked legend.
          // Applicable to small screens and/or multiple time series
          if (legend) {
            legendHeight += legend.getBBox().height;
          }
          d3.select('#obs-chart svg')
            .attr('height', $scope.config.height + legendHeight);
        };

        function containValues(dataArr) {
          if (dataArr) {
            for (var idx in dataArr) {
              var obj = dataArr[idx];
              if (dataArr.hasOwnProperty(idx) && obj.values && obj.values.length > 0) {
                return true;
              }
            }
          }
          return false;
        }

        function observationAtIndex(dataArr, idx) {
          return dataArr[0].values[idx];
        }

        function lastObservation(dataArr) {
          return observationAtIndex(dataArr, dataArr[0].values.length - 1);
        }

        function firstObservation(dataArr) {
          return observationAtIndex(dataArr, 0);
        }

        function setBrushPreset(data) {
          // Set the brush to cover the time from when it was connected to now.
          var xWestDate = $scope.config.brushPreset.west || firstObservation(data).x;
          var xWest = Date.parse(xWestDate);

          var xEastDate = new Date().toISOString();
          var xEast = Date.parse(xEastDate);
          $scope.chart.brushExtent([xWest, xEast]);
        }

        $scope.domainPaddingFactor = 0.05; // percentage of the time frame
        $scope.includePaddingThreshold = 60 * 1000;
        /**
         0 - Trims no sides: shows the full time window asked for
         1 - Trims east side: Time domain will be from start of time period selected to last timestamp of the observations
         2 - Trims both sides but leaves a padding on the left side

         If none of above is selected both sides are trimmed to first/last observation
         * @param data
         */
        function setTimeDomain(data) {
          var now = new Date();
          var first, last;
          if ($scope.config.trimSides === '0') {
            // lines2 represents the context chart lines.
            $scope.chart.lines2.forceX([+now - Number($scope.config.timeFrame), +now]);
          } else if ($scope.config.trimSides === '1') {
            last = lastObservation(data);
            $scope.chart.lines2.forceX([+now - Number($scope.config.timeFrame), last.x]);
          } else if ($scope.config.trimSides === '2') {
            first = firstObservation(data);
            last = lastObservation(data);

            // Add a padding if the time between the first
            // observation and the beginning of the time frame is greater than a threshold.
            // This to make it clear that there the first point shown in the graph
            // is actually the first point in the time series.
            var pad = 0;
            if (first.x - ((+now) - $scope.config.timeFrame) > $scope.includePaddingThreshold) {
              pad = (last.x - first.x) * $scope.domainPaddingFactor;
            }
            $scope.chart.lines2.forceX([first.x - pad, Number(last.x)]);
          } else {
            // Trim both sides is done automatically without forcing x values, hence the empty list
            $scope.chart.lines2.forceX([]);
          }
        }

        $scope.$watch('data', function (newVal, oldVal) {
          // Show the chart if it's defined or if it's the first time it's loaded,
          // even if there is no data to show.
          if ($scope.chart || (newVal && !oldVal)) {
            // Only apply preset brush if there exist data to plot.
            if (containValues(newVal)) {
              setTimeDomain(newVal);
              setBrushPreset(newVal);
            }
            $scope.updateChart();
          }
        }, true);

        $scope.$watch('config', function () {
          if ($scope.chart && containValues($scope.data)) {
            setTimeDomain($scope.data);
            setBrushPreset($scope.data);
            $scope.updateChart();
          }
        }, true);
      }
    };
  });

