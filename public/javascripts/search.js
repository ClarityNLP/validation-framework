angular.module('search', [])
.controller("searchController", ['$scope', '$timeout', '$interval', '$http', '$window', '$sce', '$cacheFactory',
	function($scope, $timeout, $interval, $http, $window, $sce, $cacheFactory) {
		var cache = $cacheFactory('searchCache');
		var currentYear = +(new Date().getFullYear());
	
		var validViewTypes = ["list", "document_detail", "subject_detail"];
		$scope.validSubjectFilters = ['documents', 'condition', 'conditionera', 'drug', 'drugera', 'measurement', 'observation', 'procedure', 'visit'],
		$scope.activeValidSubjectFilters = {
				'conditionera':true,
				'condition':true,
				'drug':true,
				'drugera':true
		};
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
		$scope.subjectCallsPending = 0;
		
		$scope.formatDate = function(d) {
			return d.toISOString().slice(0, 10);
		}
		
		$scope.formatLongDate = function(d) {
			return $scope.formatDate(new Date(d));
		}
		
		$scope.docFunction = function(d, i) {
			d.snippet = $sce.trustAsHtml(d.snippet);
			d.index = i;
			d.page = $scope.currentPage;
			d.rawDate = new Date(d.reportDate);
			d.date = $scope.formatDate(d.rawDate);
			d.reportText = d.reportText.trim();
			if (i === 0) {
				$scope.activeDocument = d;
			}
			d.type = 'document';
			return d;
		};
		
		$scope.recordFunction = function(d, i) {
			d.index = i;
			d.page = $scope.currentPage;
			d.rawDate = new Date(d.startDate);
			d.date = $scope.formatDate(d.rawDate);
			d.type = 'record';
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
			var curIndex = $scope.activeSubject.index;
			var nextIndex = (direction === 'back') ? curIndex - 1 : curIndex + 1;
			var matched = $scope.subjects.filter(function(v) {
				return v.index === nextIndex;
			});
			if (matched.length > 0) {
				$scope.showSubject(matched[0].id, true);
			}
		};
		
		$scope.showDoc = function(document) {
			$scope.activeView = "document_detail";
			$scope.activeDocument = document;
		};
		
		$scope.showSubject = function(subjectId, paging) {

			$scope.activeView = "subject_detail";
			$scope.activeSubject = {
				id : subjectId,
				subjectCallsPending : 2,
				documents : {},
				records : {},
				dates : []
			};
			var matchingSubjects = $scope.subjects.filter(function(v) {
				return (v.id + "") === (subjectId + "");
			});
			if (matchingSubjects.length > 0) {
				$scope.activeSubject.index = matchingSubjects[0].index;
			}
			// TODO query structured data
			$http.get("/subjectdocuments/" + subjectId)
			.then(function(response) {
				$scope.activeSubject.subjectCallsPending--;
				if (response && response.data) {
					if (response.data.documents) {
						response.data.documents
								.map($scope.docFunction)
								.forEach(function(elem) {
									if (!$scope.activeSubject.documents[elem.date]) {
										$scope.activeSubject.documents[elem.date] = [];
									}
									$scope.activeSubject.documents[elem.date].push(elem);
									if ($scope.activeSubject.dates.indexOf(elem.date) < 0) {
										$scope.activeSubject.dates.push(elem.date);
									}
								});
					}
				}
			}, function(error) {
				console.log(error);
			});
			$http.get("/subjectrecords/" + subjectId)
			.then(function(response) {
				$scope.activeSubject.subjectCallsPending--;
				if (response.data) {
					if (response.data.records) {
						response.data.records
								.map($scope.recordFunction)
								.forEach(function(elem) {
									if (!$scope.activeSubject.records[elem.date]) {
										$scope.activeSubject.records[elem.date] = [];
									}
									$scope.activeSubject.records[elem.date].push(elem);
									if ($scope.activeSubject.dates.indexOf(elem.date) < 0) {
										$scope.activeSubject.dates.push(elem.date);
									}
								});
					}
					if (response.data.gender) {
						$scope.activeSubject.gender = response.data.gender;
					}
					if (response.data.yearOfBirth) {
						$scope.activeSubject.yearOfBirth = response.data.yearOfBirth;
						$scope.activeSubject.age = currentYear - response.data.yearOfBirth;
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
						var sIdx = 0;
						for (var key in response.data.subjectFacets) {
							$scope.subjects.push(
								{
									'id':key,
									'index' : sIdx++,
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