angular.module('cohorts', [])
.controller("cohortController", ['$scope', '$timeout', '$interval', '$http', '$window', '$sce', '$cacheFactory',
	function($scope, $timeout, $interval, $http, $window, $sce, $cacheFactory) {
	// TODO extract out common stuff with cohorts.js and search.js
	var cache = $cacheFactory('cohortCache');

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

	$scope.cohorts = [];
	$scope.activeCohort = {};
	$scope.subjects = [];

	$scope.activeSubject = {};
	$scope.searchText = "";
	$scope.filterText = "";
	$scope.searchDocumentsWithinSubject = "";

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

	$scope.navigateSubjects = function(direction) {
		var curIndex = $scope.activeSubject.index;
		var nextIndex = (direction === 'back') ? curIndex - 1 : curIndex + 1;
		var matched = $scope.subjects.filter(function(v) {
			return v.index === nextIndex;
		});
		if (matched.length > 0) {
			$scope.filterText = "";
			$scope.showSubject(matched[0].subjectId, true);
		}
	};

	$http.get("/cohorts")
	.then(function(response) {
		if (response.data) {
			$scope.cohorts = response.data;
		}
	}, function(error) {
		console.log(error);
	});

	$scope.prettyDate = function(dString) {
		return Date.parse(dString).toString('MMMM d, yyyy');
	};
	
	$scope.showWarning = function(title, message) {
		$scope.warning = {
				title : title,
				message : message
		}
		$('#warningsModal').modal('show');
	}

	$scope.getCohortEntities = function(cohort) {
		$scope.activeCohort = cohort;
		$http.get("/cohortentities/" + cohort.id)
		.then(function(response) {
			if (response.data) {
				var members = response.data.
				map(function(c, i) {
					c.index = i;
					c.id = c.subjectId;
					return c;
				});
				$scope.subjects = members;
				if ($scope.subjects.length > 0) {
					$scope.showSubject($scope.subjects[0].subjectId, false);
				} else {
					$scope.showWarning('Warning!', 'No patients found in ' + cohort.name);
				}
			} else {
				$scope.showWarning('Warning!', 'No patients found in ' + cohort.name);
			}
		}, function(error) {
			console.log(error);
			$scope.showWarning('Warning!', 'No patients found in ' + cohort.name);
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
			
			$http.get("/subjectrecords/" + subjectId + "/false")
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
				}
			}, function(error) {
				console.log(error);
			});
			$http.get("/subjectinfo/" + subjectId + "/false")
			.then(function(response) {
				$scope.activeView = "subject_detail";
				$scope.activeSubject.subjectCallsPending--;
				if (response.data) {
					$scope.activeSubject.gender = response.data.gender;
					$scope.activeSubject.yearOfBirth = response.data.yearOfBirth;
					$scope.activeSubject.age = response.data.age;
					$scope.activeSubject.sourceId = response.data.personSourceValue;
					$scope.activeSubject.subjectId = response.data.personId;
					$http.get("/subjectdocuments/" + $scope.activeSubject.sourceId + "/*:*")
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
							}
						}
					}, function(error) {
						console.log(error);
					});
				}
			}, function(error) {
				console.log(error);
			});
		}


	};

	$scope.resetSubjectFilters = function(resetSubjectDocs) {
		$scope.searchDocumentsWithinSubject = "";
		$scope.filterText = "";
		if (resetSubjectDocs) {
			$scope.doSearchWithinSubject();
		}

	}

	$scope.doSearchWithinSubject = function() {
		$('#btn-search-within').button('loading');
		var highlightQuery = $scope.searchDocumentsWithinSubject.trim() === "" ? "*:*" : $scope.searchDocumentsWithinSubject;
		$http.get("/subjectdocuments/" + $scope.activeSubject.sourceId + "/" + highlightQuery)
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
			}
		}, function(error) {
			$('#btn-search-within').button('reset');
			console.log(error);
		});
	};

}]);