angular.module('search', [])
.controller("searchController", ['$scope', '$timeout', '$interval', '$http', '$window',
	function($scope, $timeout, $interval, $http, $window) {
		$scope.documents = [];
		$scope.currentDocuments = [];
		$scope.subjects = [];
		$scope.searchInput = "";
		$scope.currentPage = 1;
		$scope.maxSize = 10;
		$scope.rows = 50;
		
		$scope.doSearch = function() {
			
		};
	}]);