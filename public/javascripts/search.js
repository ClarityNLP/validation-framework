angular.module('search', [])
.controller("searchController", ['$scope', '$timeout', '$interval', '$http', '$window', '$sce', '$cacheFactory',
	function($scope, $timeout, $interval, $http, $window, $sce, $cacheFactory) {
		var cache = $cacheFactory('searchCache');
	
		var validViewTypes = ["list", "document_detail", "subject_detail"];
		$scope.activeView = "list"; 
		$scope.documentsSize = 0;
		$scope.currentDocuments = [];
		$scope.subjectFacets = {};
		$scope.subjects = [];
		$scope.currentPage = 1;
		$scope.searched = false;
		$scope.activeDocument = {};
		$scope.activeSubject = {};
		
		$scope.maxSize = 5;
		$scope.rows = 25;
		
		$scope.searchInput = "";
		
		$scope.docFunction = function(d, i) {
			d.snippet = $sce.trustAsHtml(d.snippet);
			d.index = i;
			d.page = $scope.currentPage;
			d.rawDate = new Date(d.reportDate);
			d.date = d.rawDate.toISOString().slice(0, 10);
			d.reportText = d.reportText.trim();
			if (i === 0) {
				$scope.activeDocument = d;
			}
			d.type = 'document';
			return d;
		};
		
		$scope.backView = function(type) {
			if (validViewTypes.indexOf(type) >= 0) {
				$scope.activeView = type;
			} else {
				$scope.activeView = "list";
			}
		};
		
		$scope.navigateDocs = function(direction) {
			var curIndex = $scope.activeDocument.index;
			var nextIndex = (direction === 'back') ? curIndex - 1 : curIndex + 1;
			$scope.activeDocument = $scope.currentDocuments.filter(function(v) {
				return v.index === nextIndex;
			})[0];
		};
		
		$scope.navigateSubjects = function(direction) {
			
		};
		
		$scope.showDoc = function(document) {
			$scope.activeView = "document_detail";
			$scope.activeDocument = document;
		};
		
		$scope.showSubject = function(subjectId, paging) {
			$scope.activeView = "subject_detail";
			$scope.activeSubject = {
				id : subjectId,
				items : []
			};
			// TODO query structured data
			$http.get("/subjectdocuments/" + subjectId)
			.then(function(response) {
				if (response && response.data) {
					if (response.data.documents) {
						$scope.activeSubject.items = response.data.documents
							.map($scope.docFunction);
					}
				}
			}, function(error) {
				console.log(error);
			});
		};
		
		$scope.doSearch = function(paging) {
			$scope.searched = true;
			
			// subjects get reloaded automatically
			$scope.subjectFacets = {};
			$scope.subjects = [];
			
			if (!paging) {
				$scope.documentsSize = 0;
				$scope.currentDocuments = [];
				$scope.currentPage = 1;
				$scope.activeDocument = {};
				$('#btn-search').button('loading');
			}
			
			var searchText = $scope.searchInput.trim();
			var curStart = ($scope.currentPage - 1) * $scope.rows;
			var curRows = $scope.rows;
			
			cache.put('searchText', searchText);
			cache.put('start', curStart);
			cache.put('rows', curRows);
			
			$http.get("/searchtext/" + searchText + "/" + curStart + "/" + curRows)
			.then(function(response) {
				$('#btn-search').button('reset');
				if (response && response.data) {
					if (response.data.documentsSize) {
						$scope.documentsSize = response.data.documentsSize;
					}
					if (response.data.documents) {
						$scope.currentDocuments = response.data.documents
							.map($scope.docFunction);
					}
					if (response.data.subjectFacets) {
						$scope.subjectFacets = response.data.subjectFacets;
						for (var key in response.data.subjectFacets) {
							$scope.subjects.push(
								{
									'id':key,
									'count':+response.data.subjectFacets[key]
								}
							);
							
						}
					}
				}
			},function(response) {
				$('#btn-search').button('reset');
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