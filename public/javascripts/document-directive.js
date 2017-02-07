angular.module('document-directive', [])
.directive('documentView', function() {
  return {
    restrict: 'E',
    scope: {
      documentInfo: '=doc',
      viewType: '=viewtype'
    },
    link : function($scope) {
    },
    templateUrl: 'assets/templates/document.html'
  };
});