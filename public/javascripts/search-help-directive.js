angular.module('document-directive', [])
.directive('documentView', function() {
  return {
    restrict: 'E',
    scope: {
      documentInfo: '=doc'
    },
    templateUrl: 'assets/templates/document.html'
  };
});