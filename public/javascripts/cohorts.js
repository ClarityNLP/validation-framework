angular.module('cohorts', [])
.controller("cohortController", ['$scope', '$timeout', '$interval', '$http', '$window', '$sce', '$cacheFactory',
	function($scope, $timeout, $interval, $http, $window, $sce, $cacheFactory) {
	// TODO extract out common stuff with cohorts.js and search.js
	var cache = $cacheFactory('cohortCache');

	$scope.mode = "cohort";
	var validViewTypes = ["list", "subject_detail"];
	$scope.activeView = "list"; 

	$scope.validSubjectFilters = ['condition', 'conditionera', 'death', 'device', 'drug', 'drugera', 'measurement', 'observation', 'procedure', 'specimen', 'visit', 'documents'];
	$scope.activeValidSubjectFilters = {
			'condition':true,
			'drug':true,
			'documents':true
	};
	
	$scope.validJumpTypes = ["Patient ID", "Patient Source Value", "Index"];
	$scope.activeJumpType = "Patient ID";

	$scope.cohorts = [];
	$scope.activeCohort = {};
	$scope.subjects = [];

	$scope.activeSubject = {};
	$scope.searchText = "";
	$scope.filterText = "";
	$scope.filterToggle = "all";
	$scope.searchDocumentsWithinSubject = "";

	$scope.subjectCallsPending = 0;
	$scope.jumpDay = 0;
	
	$scope.checkAllFilters = function(on) {
		$scope.validSubjectFilters.
			forEach(function(f) {
				$scope.activeValidSubjectFilters[f] = on;
			});
	};
	
	
	
	$scope.isActiveJumpType = function(t) {
		if ($scope.activeJumpType === t) {
			return "list-group-item active";
		} else {
			return "list-group-item";
		}
	}
	
	$scope.setActiveJumpType = function(type) {
		$scope.activeJumpType = type;
	}
	
	$scope.jumpToRecord = function() {
		$scope.jumpError="";
		$('#jumpModal').modal('show');
		$('#jumpText').focus();
		
	}
	
	$scope.doJumpToRecord = function() {
		var key = $scope.jumpText;
		if ($scope.activeJumpType === "Index") {
			var matched = $scope.subjects.filter(function(v) {
				return ((v.index + 1) + "") === (key + "");
			});
			if (matched.length > 0) {
				$('#jumpModal').modal('hide');
				$scope.jumpText = "";
				$scope.activeJumpType = "Patient ID";
				$scope.showSubject(matched[0].subjectId, true);
			} else {
				$scope.jumpError = "No matching patients found!";
			}
		} else {
			var useSourceValue = true;
			if ($scope.activeJumpType === "Patient ID") {
				useSourceValue = false;
			}
			$http.get("/subjectinfo/" + key  + "/" + useSourceValue)
			.then(function(response) {
				$scope.activeView = "subject_detail";
				$scope.activeSubject.subjectCallsPending--;
				if (response.data && response.data.personId && response.data.personId !== 0) {
					$('#jumpModal').modal('hide');
					$scope.jumpText = "";
					$scope.activeJumpType = "Patient ID";
//					$scope.activeSubject.sourceId = response.data.personSourceValue;
//					$scope.activeSubject.subjectId = response.data.personId;
					$scope.showSubject(response.data.personId, true);
				} else {
					$scope.jumpError = "No matching patients found!";
				}
			}, function(error) {
				$scope.jumpError = "No matching patients found!";
				console.log(error);
			});
		}
	}
	
	$scope.formatDate = function(d) {
		return d.toISOString().slice(0, 10);
	}

	$scope.prettyDate = function(dString) {
		return Date.parse(dString).toString('M/d/yy');
	};

	$scope.formatLongDate = function(d) {
		return $scope.formatDate(new Date(d));
	}

	$scope.capitalize = function(n) {
		return n.replace(/\b\w/g, function(l){ return l.toUpperCase() });
	};
	
	$scope.getDateOffset = function(d) {
		if (!$scope.activeSubject.indexDate) {
			return 0;
		} else {
			var curDate = Date.parse(d);
			var indexDate = Date.parse($scope.activeSubject.indexDate);
			return Date.daysBetween(indexDate, curDate);
		}
	}
	
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
		d.dateOffset = $scope.getDateOffset(d.date);
		d.prettyDate = $scope.prettyDate(d.date);
		return d;
	};
	
	$scope.recordFunction = function(d, i) {
		d.index = i;
		d.page = $scope.currentPage;
		d.rawDate = new Date(d.startDate);
		d.date = $scope.formatDate(d.rawDate);
		d.displayName = d.sourceConceptName && d.sourceConceptName.length > 0 ?
				d.sourceConceptName : d.conceptName;
		
		d.dateOffset = $scope.getDateOffset(d.date);
		d.prettyDate = $scope.prettyDate(d.date);
		d.prettyDomain = $scope.capitalize(d.domain);
		
		if (+d.dateOffset < $scope.activeSubject.minIndex) {
			$scope.activeSubject.minIndex = +d.dateOffset;
		}
		if (+d.dateOffset > $scope.activeSubject.maxIndex) {
			$scope.activeSubject.maxIndex = +d.dateOffset;
		}

		d.type = 'record';
		if (d.domain == 'drug') {
			d.sourceConceptValue = "";
		}
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

	
	$scope.showWarning = function(title, message) {
		$scope.warning = {
				title : title,
				message : message
		}
		$('#warningsModal').modal('show');
	}
	
	$scope.gotoIndexDate = function() {
		 $(".td-offset[attr-offset='0']:first")[0].scrollIntoView();
	};
	
	$scope.jumpToSpecificDate = function(day) {
		var first = $(".td-offset[attr-offset='" + day + "']:first");
		if (first.length > 0) {
			 $(".td-offset[attr-offset='" + day + "']:first")[0].scrollIntoView();
		}
	};

	$scope.getCohortEntities = function(cohort) {
		$scope.activeCohort = cohort;
		$http.get("/cohortentities/" + cohort.id)
		.then(function(response) {
			if (response.data) {
				var members = response.data.
				map(function(c, i) {
					c.index = i;
					c.id = c.subjectId;
					c.indexDate = c.cohortStartDate;
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
	
	$scope.showSlider = function() {
		$('#slider').empty();
//		var div = $('#slider').append('<div/>')[0];
//		var handlesSlider = div;
//
//		noUiSlider.create(handlesSlider, {
//		
//			start: [ $scope.activeSubject.minIndex, $scope.activeSubject.maxIndex  ],
//			step: 1,
//			behaviour: 'snap',
//			connect: true,
//			range: {
//				'min': $scope.activeSubject.minIndex ,
//				'max':  $scope.activeSubject.maxIndex ,
//			}
//		});
	}

	$scope.showSubject = function(subjectId, paging) {
		$scope.resetSubjectFilters(false);
		
		$scope.activeSubject = {
				id : subjectId,
				subjectCallsPending : 3,
				documents : {},
				records : {},
				dates : [],
				recordCounts : {},
				docCount : 0,
				maxIndex : 0,
				minIndex : 0
		};
		var matchingSubjects = $scope.subjects.filter(function(v) {
			return (v.id + "") === (subjectId + "");
		});
		if (matchingSubjects.length > 0) {
			$scope.activeSubject.index = matchingSubjects[0].index;
			$scope.activeSubject.indexDate = matchingSubjects[0].indexDate;
			
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
					if ($scope.activeSubject.subjectCallsPending === 0) {
						$scope.showSlider();
					}
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
								if ($scope.activeSubject.subjectCallsPending === 0) {
									$scope.showSlider();
								}
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
	
	$scope.filterOnName = function(name) {
		if (name === $scope.filterText) {
			$scope.filterText = '';
		} else {
			$scope.filterText = name;
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
					
					$(".documentInfo:first")[0].scrollIntoView();
				}
			}
		}, function(error) {
			$('#btn-search-within').button('reset');
			console.log(error);
		});
	};

}]);