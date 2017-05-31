import React from 'react';
import axios from 'axios';
import _ from 'lodash';

import ChartData from './SubjectChartData.jsx';

const Filter = (props) => {
    let className = "text-filter text-" + props.name;
    let display = " " + _.capitalize(props.name);
    let checked = props.filterMap[props.name].checked;
    return (
        <div>
            <label className={className}>
                <input type="checkbox" name={props.name} className="subject-filter-checkbox" checked={checked} onChange={props.handleFilterChange} />
                {display} ({props.count})
            </label>
        </div>
    );
};

const FilterList = (props) => {
    const filterList = Object.keys(props.filters);
    const counts = props.counts;
    return (
        <div>
            {filterList.map(filter => <Filter key={filter} name={filter}
                                              handleFilterChange={props.handleFilterChange}
                                              filterMap={props.filters} count={counts[filter] || 0} />)}
        </div>
    );
};

const Question = (props) => {
    return (
        <div>
            <h5>{props.index}. {props.question_name}</h5>
        </div>
    )
};

const QuestionList = (props) => {
    return (
        <div>
            
            {props.questions.map(q => <Question key={q.annotation_question_id}
                        index={q.index} name={q.question_name} answers={props.answers[q.annotation_question_id]}/>) }
        </div>
    );
};

class DataStore {
    constructor(data) {
        this.curIndex = (data && data.length) || 0;
        this._cache = data || [];
    }

    addObject(data) {
        if (data) {
            data.id = this.curIndex;
            this._cache[this.curIndex] = data;
            this.curIndex += 1;
        }
    }


    getObjectAt(/*number*/ index) /*?object*/ {
        if (index < 0 || index > this.size){
            return undefined;
        }
        if (this._cache[index] === undefined) {
            console.log(index + " not found!");
            return undefined;
        }
        return this._cache[index];
    }

    getAll() {
        if (this._cache.length < this.size) {
            for (var i = 0; i < this.size; i++) {
                this.getObjectAt(i);
            }
        }
        return this._cache.slice();
    }

    getSize() {
        return this.curIndex;
    }
}

class SubjectDetail extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            chartHeight : 500,
            chartWidth: 400,
            chartData : new DataStore([]),
            goToDay : 'index',
            filters : {
                condition : { checked : true },
                conditionera : {},
                death : {},
                device : {},
                drug : { checked : true },
                drugera : {},
                measurement : {},
                observation : {},
                procedure : {},
                specimen : {},
                visit : {},
                documents : { checked : true }
            },
            domainCounts : {
                condition : 0,
                conditionera : 0,
                death : 0,
                device : 0,
                drug : 0,
                drugera : 0,
                measurement : 0,
                observation :0,
                procedure : 0,
                specimen : 0,
                visit : 0,
                documents : 0
            },
            totalCount : 0
        };

        this.lookupPatientData = this.lookupPatientData.bind(this);
        this.formatDate = this.formatDate.bind(this);
        this.prettyDate = this.prettyDate.bind(this);
        this.formatLongDate = this.formatLongDate.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.sort = this.sort.bind(this);
        this.selectFilters = this.selectFilters.bind(this);
        this.setDomainCounts = this.setDomainCounts.bind(this);
        this.setTotalCount = this.setTotalCount.bind(this);

        this.maxIndex = 0;
        this.minIndex = 0;
        this.dataStore = new DataStore([]);
    }

    formatDate(d) {
        return d.toISOString().slice(0, 10);
    };

    prettyDate(dString) {
        var d = Date.parse(dString);
        if (d) {
            return d.toString('M/d/yy');
        } else {
            return '';
        }
    };

    formatLongDate(d) {
        return this.formatDate(new Date(d));
    };

    getDateOffset(d) {
        if (!this.props.subject.indexDate) {
            return 0;
        } else {
            var curDate = Date.parse(d);
            var indexDate = Date.parse(this.props.subject.indexDate);
            return Date.daysBetween(indexDate, curDate);
        }
    };

    updateDimensions() {
        var element = document.getElementById('chart-data-div');
        var positionInfo = element.getBoundingClientRect();
        var height = (window.innerHeight - 170) || positionInfo.height;
        var width = +positionInfo.width - 20;
        this.setState(prevState => ({ chartWidth : width, chartHeight : height }));
    };

    sort(sortDir, columnKey, secondaryColumnKey) {
        var sorted = this.dataStore._cache.slice();

        sorted.sort((indexA, indexB) => {
            var valueA = indexA[columnKey];
            var valueB = indexB[columnKey];

            var valueA2 = indexA[secondaryColumnKey];
            var valueB2 = indexB[secondaryColumnKey];

            var sortVal = valueA === valueB ? 0 : valueA < valueB ? -1 : 1;

            if (sortVal === 0) {
                sortVal = valueA2 === valueB2 ? 0 : valueA2 < valueB2 ? -1 : 1;
            }

            if (sortVal !== 0 && sortDir === 'desc') {
                sortVal = sortVal * -1;
            }

            return sortVal;
        });

        return sorted;
    }

    selectFilters(which) {
        var filterMap = this.state.filters;
        Object.keys(filterMap).forEach((f) => filterMap[f].checked = (which === 'all'));
        this.setState(prevState => ({ filters : filterMap }));
    }

    handleFilterChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        let filterMap = this.state.filters;
        filterMap[name].checked = value;
        //console.log(filterMap);

        this.setState(prevState => ({
            filters : filterMap
        }));
    };

    setDomainCounts(newCounts) {
        if (newCounts != this.state.domainCounts) {
            //console.log(newCounts);
            this.setState(prevState => ({
                domainCounts: newCounts
            }));
        }
    }

    setTotalCount(newCount) {
        if (newCount !== this.state.totalCount) {
            //console.log(newCount);
            this.setState(prevState => ({
                totalCount: newCount
            }));
        }
    }

    lookupPatientData() {
        console.log('lookup patient data');
        this.dataStore = new DataStore([]);
        this.setState(prevState => ({
            loading : true,
            chartData : new DataStore([]),
            domainCounts : {},
            totalCount : 0
        }));
        axios.get("/subjectrecords/" + this.props.subject.subjectId + "/false")
            .then((response) => {
                response.data.map((d, i) => {
                    d.displayName = d.sourceConceptName && d.sourceConceptName.length > 0 ?
                        d.sourceConceptName : d.conceptName;

                    if (d.displayName === "No matching concept") {
                        return null;
                    }
                    d.rawDate = new Date(d.startDate);
                    d.date = this.formatDate(d.rawDate);

                    d.dateOffset = this.getDateOffset(d.date);
                    d.prettyDate = this.prettyDate(d.date);

                    this.minIndex = +d.dateOffset < this.minIndex ? +d.dateOffset : this.minIndex;
                    this.maxIndex = +d.dateOffset > this.minIndex ? + d.dateOffset : this.maxIndex;

                    d.type = 'record';
                    if (d.domain == 'drug') {
                        d.sourceConceptValue = "";
                    }
                    this.dataStore.addObject(d);
                    return null;
                });
                axios.get("/subjectdocuments/" + this.props.subject.sourceValue + "/*:*")
                    .then((response) => {
                        if (response.data.documents) {
                            response.data.documents.map((d, i) => {
                                if (d.reportText.length === 0) {
                                    return null;
                                }
                                d.displayName = d.reportText;
                                d.reportText = null;
                                d.rawDate = new Date(d.reportDate);
                                d.date = this.formatDate(d.rawDate);

                                d.domain = 'documents';
                                d.type = 'document';
                                d.dateOffset = this.getDateOffset(d.date);
                                d.prettyDate = this.prettyDate(d.date);

                                this.dataStore.addObject(d);
                                return null;
                            });
                        }
                        // do sort
                        this.setState(prevState => ({
                            chartData : new DataStore(this.sort('asc', 'dateOffset', 'displayName')),
                            loading : false,
                            goToDay : 'top'
                        }));
                        this.dataStore = null;

                        // update state and dimensions
                        this.updateDimensions();

                    }).catch(function (error) {
                    console.log(error);
                });
            }).catch(function (error) {
            console.log(error);
        });
    };

    componentWillMount() {
    };

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
        this.updateDimensions();
    };

    componentDidMount() {
        window.addEventListener("resize", this.updateDimensions);
        this.lookupPatientData();
    };

    componentDidUpdate(prevProps, prevState) {
        if (this.props.subject && prevProps.subject.subjectId !== this.props.subject.subjectId) {
            console.log(this);
            this.lookupPatientData();
        }
    };

    render() {
        return (
            <div className="row" style={{padding:"0px 20px"}}>
                <div className="col-xs-12">
                    <div className="row">
                        <div className="col-md-2">
                            <div className="sidebar-nav-fixed">
                                <div>
                                    <button className="btn btn-default btn-sm" onClick={() => {this.props.backToList()}}>&laquo; Back</button>
                                </div>
                                <div style={{marginTop:"30px"}}>
                                    <div>
                                        <h5><small style={{color:"#555"}}>#{this.props.subject.sourceValue}</small> </h5>
                                        {this.props.subject.age !== "" && this.props.subject.gender !== ""  ? <h6>{this.props.subject.age  + " yo " + this.props.subject.gender}</h6> : <div></div>}
                                    </div>
                                </div>
                                <div style={{marginTop: "20px"}}>
                                    <a onClick={() => this.setState({goToDay : 'top'})}>Top</a> | <a onClick={() => this.setState({goToDay : 'index'})}>Index</a> | <a onClick={() => this.setState({goToDay : 'bottom'})}>Bottom</a>
                                </div>
                                <div style={{marginTop: "20px"}}>
                                    <h6>Filters ({this.state.totalCount}): <small><a onClick={() => {this.selectFilters('all')}}>all</a> | <a onClick={() => {this.selectFilters('none')}}>none</a></small></h6>
                                    <FilterList filters={this.state.filters} handleFilterChange={this.handleFilterChange} counts={this.state.domainCounts} />
                                </div>
                            </div>
                        </div>
                        <div id="chart-data-div" className="col-md-8">
                            { this.state.loading ? <div style={{marginTop:"40px"}} align="center"><span><i className="fa fa-circle-o-notch fa-spin"></i></span>  Loading...</div> :
                                <ChartData chartdata={this.state.chartData} height={this.state.chartHeight}
                                           width={this.state.chartWidth} filters={this.state.filters} goToDay={this.state.goToDay}
                                           setDomainCounts={this.setDomainCounts} setTotalCount={this.setTotalCount}
                                />
                            }
                        </div>
                        <div className="col-md-2">
                            <div className="pull-right">
                                <div >
                                    <button className="btn btn-sm btn-default" style={{float:"right"}} onClick={() => {this.props.navigateSubjects(1)}}>Next &raquo;</button>
                                    <button className="btn btn-sm btn-default" style={{float:"right"}} onClick={() => {this.props.navigateSubjects(-1)}}>&laquo; Previous</button>
                                </div>
                            </div>
                            { this.props.viewOnly && this.props.questions ? <span></span> :
                                <div>
                                    <QuestionList questions={this.props.questions} answers={this.props.answers}
                                        results={this.props.results} />
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}

export default SubjectDetail;
