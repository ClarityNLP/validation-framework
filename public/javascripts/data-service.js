angular.module('data-service', [])
.service('dataService', function(){
	this.validSubjectFilters = ['condition', 'conditionera', 'death', 'device', 'drug', 'drugera', 'measurement', 'observation', 'procedure', 'specimen', 'visit', 'documents'];
	this.defaultSubjectFilters =  {
			'condition':true,
			'drug':true,
			'documents':true
	};

	this.formatDate = function(d) {
		return d.toISOString().slice(0, 10);
	};

	this.prettyDate = function(dString) {
		var d = Date.parse(dString);
		if (d) {
			return d.toString('M/d/yy');
		} else {
			return '';
		}
	};

	this.formatLongDate = function(d) {
		return this.formatDate(new Date(d));
	};

	this.capitalize = function(n) {
		return n.replace(/\b\w/g, function(l){ return l.toUpperCase() });
	};
	

});
