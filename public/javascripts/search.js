angular.module('search', [])
.controller("searchController", ['$scope', '$timeout', '$interval', '$http', '$window', '$sce', '$cacheFactory',
	function($scope, $timeout, $interval, $http, $window, $sce, $cacheFactory) {
		var cache = $cacheFactory('searchCache');
	
		var validViewTypes = ["list", "document_detail", "patient_detail"];
		$scope.activeView = "list"; 
		$scope.documentsSize = 0;
		$scope.currentDocuments = [];
		$scope.subjectFacets = {};
		$scope.subjects = [];
		$scope.currentPage = 1;
		$scope.maxSize = 5;
		$scope.rows = 25;
		$scope.searched = false;
		$scope.activeDocument = {};
		
		$scope.searchInput = "";
		
		$scope.backView = function(type) {
			if (validViewTypes.indexOf(type) >= 0) {
				$scope.activeView = type;
			} else {
				$scope.activeView = "list";
			}
		};
		
		$scope.navigateDocs = function(direction) {
			
		};
		
		$scope.showDoc = function(document) {
			$scope.activeView = "document_detail";
			$scope.activeDocument = document;
		};
		
		$scope.doSearch = function(paging) {
			$scope.searched = true;
			
			if (!paging) {
				$('a[href="#results"]').trigger('click');
				$scope.documentsSize = 0;
				$scope.currentDocuments = [];
				$scope.subjectFacets = {};
				$scope.subjects = [];
				$scope.currentPage = 1;
				$scope.activeDocument = {};
			}
			
			var searchText = $scope.searchInput.trim();
			var curStart = ($scope.currentPage - 1) * $scope.rows;
			var curRows = $scope.rows;
			
			cache.put('searchText', searchText);
			cache.put('start', curStart);
			cache.put('rows', curRows);
			
			$http.get("/searchtext/" + searchText + "/" + curStart + "/" + curRows)
			.then(function(response) {
				if (response && response.data) {
					if (response.data.documentsSize) {
						$scope.documentsSize = response.data.documentsSize;
					}
					if (response.data.documents) {
						$scope.currentDocuments = response.data.documents
							.map(function(d, i) {
								d.snippet = $sce.trustAsHtml(d.snippet);
								d.index = i;
								d.page = $scope.currentPage;
								d.reportDate = new Date(d.reportDate).toISOString().slice(0, 10);
								d.reportText = d.reportText.trim();
								return d;
							});
					}
					if (response.data.subjectFacets) {
						$scope.subjectFacets = response.data.subjectFacets;
						$scope.subjects = Object.keys(response.data.subjectFacets);
					}
				}
			},function(response) {
				console.log("error getting back documents")
			});
		};


	  $scope.pageChanged = function() {
	    if ($scope.searchInput != "") {
			// only do pagination if values
			$scope.doSearch(true)
		}
	  };

	}]);