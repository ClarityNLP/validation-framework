angular.module('search', [])
.controller("searchController", ['$scope', '$timeout', '$interval', '$http', '$window', '$sce', '$cacheFactory',
	function($scope, $timeout, $interval, $http, $window, $sce, $cacheFactory) {
	// TODO extract out common stuff with cohorts.js and search.js
	var cache = $cacheFactory('searchCache');
	var currentYear = +(new Date().getFullYear());

	$scope.mode = "search";
	var validViewTypes = ["list", "document_detail", "subject_detail"];
	$scope.activeView = "list"; 
	$scope.validSubjectFilters = ['condition', 'conditionera', 'death', 'device', 'drug', 'drugera', 'measurement', 'observation', 'procedure', 'specimen', 'visit', 'documents'];
	$scope.activeValidSubjectFilters = {
			'condition':true,
			'drug':true,
			'documents':true,
			'measurement':true,
			'observation':true,
			'procedure':true
	};
	

	$scope.documentsSize = 0;
	$scope.currentDocuments = [];
	$scope.subjectFacets = {};
	$scope.subjects = [];
	$scope.currentPage = 1;
	$scope.searched = false;
	$scope.activeDocument = {};
	$scope.activeSubject = {};
	$scope.searchText = "";
	$scope.filterText = "";
	$scope.searchDocumentsWithinSubject = "";

	$scope.maxSize = 5;
	$scope.rows = 25;

	$scope.searchInput = "";
	$scope.subjectCallsPending = 0;
	
	

	$scope.formatDate = function(d) {
		return d.toISOString().slice(0, 10);
	}

	$scope.prettyDate = function(dString) {
		return Date.parse(dString).toString('MMMM d, yyyy');
	};

	$scope.formatLongDate = function(d) {
		return $scope.formatDate(new Date(d));
	}

	$scope.capitalize = function(n) {
		return n.replace(/\b\w/g, function(l){ return l.toUpperCase() });
	};

	$scope.activeFilterCount = function(f) {
		var count = 0;
		if (f === 'documents') {
			count = $scope.activeSubject.docCount;
		} else {
			count = $scope.filterRecords.filter(function(d) {
				return d.domain === f;
			}).length;
		}
		return count;
	}

	$scope.setCounts = function(type) {
		// TODO this is slow; implement as a custom filter?
		// implementing custom show/hide, angular didn't expose anything obvious, that wasn't super slow

//		$timeout(function() {
//		if ($scope.activeSubject.dates) {
//		$scope.activeSubject.dates
//		.forEach(function(elem) {
//		var rows = $('tr[attr-date="' + elem + '"]:visible').length;
//		var docs = $('.doc-row[attr-date="' + elem + '"]:visible').length;
//		var total = rows + docs;
//		if (total === 0) {
//		$('.date-section[attr-date="' + elem + '"]').hide();
//		} else {
//		$('.date-section[attr-date="' + elem + '"]').show();
//		}
//		});
//		}

//		if (!type || type === 'docs') {
//		var docs = $('.doc-row:visible').length;
//		$('.filter-count[attr-domain="documents"]').text(docs);

//		}
//		if (!type || type === 'recs') {
//		$scope.validSubjectFilters
//		.forEach(function(elem) {
//		if (elem !== 'documents') {
//		var count = $('tr[attr-domain="' + elem + '"]:visible').length;
//		$('.filter-count[attr-domain="' + elem + '"]').text(count);
//		}
//		});
//		}

//		}, 10);

	};

//	$scope.$watch('[activeValidSubjectFilters, filterText, filteredRecords]', function (newValue, oldValue) {
//	$scope.setCounts('recs');
//	console.log(newValue);
//	}, true);

	$scope.docFunction = function(d, i) {
		d.snippet = $sce.trustAsHtml(d.snippet);
		d.index = i;
		d.page = $scope.currentPage;
		d.rawDate = new Date(d.reportDate);
		d.date = $scope.formatDate(d.rawDate);
		d.reportText = $sce.trustAsHtml(d.reportText);
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
		d.displayName = d.sourceConceptName && d.sourceConceptName.length > 0 ?
				d.sourceConceptName : d.conceptName;
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
		var nextDoc = $scope.currentDocuments.filter(function(v) {
			return v.index === nextIndex;
		})[0];
		$scope.showDoc(nextDoc);
	};

	$scope.navigateSubjects = function(direction) {
		var curIndex = $scope.activeSubject.index;
		var nextIndex = (direction === 'back') ? curIndex - 1 : curIndex + 1;
		var matched = $scope.subjects.filter(function(v) {
			return v.index === nextIndex;
		});
		if (matched.length > 0) {
			$scope.filterText = "";
			$scope.searchDocumentsWithinSubject = "";
			$scope.showSubject(matched[0].id, true);
		}
	};

	$scope.showDoc = function(document) {
		$scope.activeView = "document_detail";
		$scope.activeDocument = document;
		// this will retrieve proper highlighting
		$http.get("/report/" + document.reportId + "/" + $scope.searchText)
		.then(function(response) {
			if (response.data) {
				if (response.data.documents && response.data.documents.length > 0) {
					var doc = response.data.documents[0];
					// in this case, the 'snippet' is returning the full highlighted text
					if (doc.snippet && doc.snippet.length > 0) {
						doc.reportText = doc.snippet;
					}
					$scope.activeDocument.reportText = $sce.trustAsHtml(doc.reportText);

				}

			}
		}, function(error) {
			console.log(error);
		});

	};

	$scope.showSubject = function(subjectId, paging) {
		$scope.resetSubjectFilters(false);
		
		$scope.activeSubject = {
				id : subjectId,
				subjectCallsPending : 3,
				documents : {},
				records : {},
				dates : [],
				recordCounts : {},
				docCount : 0
		};
		var matchingSubjects = $scope.subjects.filter(function(v) {
			return (v.id + "") === (subjectId + "");
		});
		if (matchingSubjects.length > 0) {
			$scope.activeSubject.index = matchingSubjects[0].index;
		}
		$http.get("/subjectdocuments/" + subjectId + "/*:*")
		.then(function(response) {
			$scope.activeSubject.subjectCallsPending--;
			if (response && response.data) {
				if (response.data.documents) {
					$scope.activeSubject.docCount = response.data.documents.length;
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
						if (!$scope.activeSubject.recordCounts[elem.date]) {
							$scope.activeSubject.recordCounts[elem.date] = 0;
						}
						$scope.activeSubject.recordCounts[elem.date] += 1;
					});
					$scope.setCounts('docs');
				}
			}
		}, function(error) {
			console.log(error);
		});
		$http.get("/subjectrecords/" + subjectId + "/solrconfig")
		.then(function(response) {
			$scope.activeSubject.subjectCallsPending--;
			if (response.data) {
				response.data
				.filter(function(r) {
					return +r.conceptId !== 0;
				})
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
				$scope.setCounts('recs');
			}
		}, function(error) {
			console.log(error);
		});
		$http.get("/subjectinfo/" + subjectId + "/solrconfig")
		.then(function(response) {
			$scope.activeView = "subject_detail";
			$scope.activeSubject.subjectCallsPending--;
			if (response.data) {
				$scope.activeSubject.gender = response.data.gender;
				$scope.activeSubject.yearOfBirth = response.data.yearOfBirth;
				$scope.activeSubject.age = response.data.age;
				$scope.activeSubject.sourceId = response.data.personSourceValue;
				$scope.activeSubject.subjectId = response.data.personId;
			}
		}, function(error) {
			console.log(error);
		});
	};

	$scope.doSearchWithinSubject = function() {
		$('#btn-search-within').button('loading');
		var highlightQuery = $scope.searchDocumentsWithinSubject.trim() === "" ? "*:*" : $scope.searchDocumentsWithinSubject;
		$http.get("/subjectdocuments/" + $scope.activeSubject.id + "/" + highlightQuery)
		.then(function(response) {
			$('#btn-search-within').button('reset');
			if (response && response.data) {
				if (response.data.documents) {
					$scope.activeSubject.documents = {};
					$scope.activeSubject.docCount = response.data.documents.length;
					response.data.documents
					.map(function(d) {
						if (d.snippet && d.snippet.length > 0) {
							d.reportText = d.snippet;
						}
						return d;
					})	
					.map($scope.docFunction)
					.forEach(function(elem) {
						if (!$scope.activeSubject.documents[elem.date]) {
							$scope.activeSubject.documents[elem.date] = [];
						}
						$scope.activeSubject.documents[elem.date].push(elem);
					});
				}
				$scope.setCounts('docs');
			}
		}, function(error) {
			$('#btn-search-within').button('reset');
			console.log(error);
		});
	};

	$scope.doSearch = function(paging) {
		$scope.activeValidSubjectFilters = {
				'condition':true,
				'drug':true,
				'documents':true,
				'measurement':true,
				'observation':true,
				'procedure':true
		};

		$scope.searched = true;
		$scope.resetSubjectFilters(false);

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

		$scope.searchText = $scope.searchInput.trim();
		var curStart = ($scope.currentPage - 1) * $scope.rows;
		var curRows = $scope.rows;

		cache.put('searchText', $scope.searchText);
		cache.put('start', curStart);
		cache.put('rows', curRows);

		$http.get("/searchtext/" + $scope.searchText + "/" + curStart + "/" + curRows)
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

	$scope.resetSubjectFilters = function(resetSubjectDocs) {
		$scope.searchDocumentsWithinSubject = "";
		$scope.filterText = "";
		
		if (resetSubjectDocs) {
			$scope.doSearchWithinSubject();
		}

	}

	$scope.pageChanged = function() {
		if ($scope.searchInput != "") {
			// only do pagination if values
			$scope.doSearch(true)
		}
	};


}]);