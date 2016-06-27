/*
 * https://github.com/legalthings/signature-pad-angular
 * Copyright (c) 2015 ; Licensed MIT
 */

angular.module('signature', []);

angular.module('signature').directive('signaturePad', ['$window', '$timeout',
  function ($window, $timeout) {
    'use strict';

    var EMPTY_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';

    return {
      restrict: 'EA',
      replace: true,
      template: (
        '<div class="signature" ng-style="{height: height + \'px\', width: width + \'px\'}">' +
        '<canvas ng-mouseup="updateModel()" style="width: 100%; height: 100%;"></canvas>' +
        '</div>'
      ),
      scope: {
        accept: '=',
        clear: '=',
        dataurl: '=?',
        isEmpty: '=?',
        height: '@',
        width: '@',
        minWidth: '@',
        maxWidth: '@',
      },
      controller: [
        '$scope',
        function ($scope) {
          $scope.isEmpty = function () {
            return $scope.signaturePad.isEmpty();
          };

          $scope.accept = function () {
            var signature = {};

            if (!$scope.signaturePad.isEmpty()) {
              signature.dataUrl = $scope.signaturePad.toDataURL();
              signature.isEmpty = false;
            } else {
              signature.dataUrl = EMPTY_IMAGE;
              signature.isEmpty = true;
            }

            return signature;
          };

          $scope.updateModel = function () {
            var result = $scope.accept();
            $scope.dataurl = result.isEmpty ? undefined : result.dataUrl;
          };

          $scope.clear = function () {
            $scope.signaturePad.clear();
            $scope.dataurl = undefined;
          }

          $scope.$watch(['width', 'height'], $scope.onResize);
        }
      ],
      link: function (scope, element) {
        var canvas = element.find('canvas')[0];
        var ratio = Math.max($window.devicePixelRatio || 1, 1);
        scope.signaturePad = new SignaturePad(canvas, {
          minWidth: (scope.minWidth || 0.5) * ratio,
          maxWidth: (scope.maxWidth || 2.5) * ratio
        });

        if (scope.signature && !scope.signature.$isEmpty && scope.signature.dataUrl) {
          scope.signaturePad.fromDataURL(scope.signature.dataUrl);
        }

        scope.onResize = function () {
          var newWidth = Math.round(scope.width * ratio);
          var newHeight = Math.round(scope.height * ratio);

          if (canvas.width !== newWidth || canvas.height !== newHeight) {
            canvas.width = newWidth;
            canvas.height = newHeight;
            scope.signaturePad.clear();
          }
        };

        scope.onResize();
      }
    };
  }
]);

// Backward compatibility
angular.module('ngSignaturePad', ['signature']);
