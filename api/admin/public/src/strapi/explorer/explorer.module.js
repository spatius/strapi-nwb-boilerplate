(function () {
  'use strict';

  // Init module.
  var module = angular.module('frontend.strapi.explorer', ['ngQuill']);

  // declare a module and load quillModule
  module.config(['ngQuillConfigProvider', function (ngQuillConfigProvider) {
      ngQuillConfigProvider.set([{
          alias: '10',
          size: '10px'
      }, {
          alias: '12',
          size: '12px'
      }, {
          alias: '14',
          size: '14px'
      }, {
          alias: '16',
          size: '16px'
      }, {
          alias: '18',
          size: '18px'
      }, {
          alias: '20',
          size: '20px'
      }, {
          alias: '22',
          size: '22px'
      }, {
          alias: '24',
          size: '24px'
      }], [{
          label: 'Arial',
          alias: 'Arial'
      }, {
          label: 'Sans Serif',
          alias: 'sans-serif'
      }, {
          label: 'Serif',
          alias: 'serif'
      }, {
          label: 'Monospace',
          alias: 'monospace'
      }, {
          label: 'Trebuchet MS',
          alias: '"Trebuchet MS"'
      }, {
          label: 'Verdana',
          alias: 'Verdana'
      }]);
  }]);
  module.controller('ExplorerEditCtrl', [
      '$scope',
      'ngQuillConfig',
      function($scope, ngQuillConfig) {
          $scope.showToolbar = true;
          $scope.translations = angular.extend({}, ngQuillConfig.translations, {
              10: 'smallest'
          });
          $scope.toggle = function() {
              $scope.showToolbar = !$scope.showToolbar;
          };
      }
  ]);
})();
