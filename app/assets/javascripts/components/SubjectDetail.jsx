import React from 'react';
import axios from 'axios';
import _ from 'lodash';

import ChartData from './ChartData.jsx';

class SubjectDetail extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            records: [],
            minIndex : 0,
            maxIndex : 0,
            loading: true
        };
        this.origRecords = [];

        this.formatDate = this.formatDate.bind(this);
        this.prettyDate = this.prettyDate.bind(this);
        this.formatLongDate = this.formatLongDate.bind(this);
        this.capitalize = this.capitalize.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
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

    capitalize(n) {
        return n.replace(/\b\w/g, function(l){ return l.toUpperCase() });
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

    handleFilterChange(event) {
        var val = event.target.value.toLowerCase();
        if (val.trim() === "") {
            this.setState(prevState =>
                ({
                    records: this.origRecords
                }));
        } else {
            this.setState(prevState =>
                ({
                    records: this.origRecords.filter((item) => {
                        return item.searchName.search(val) !== -1;
                    })
                }));
        }
    }


    componentDidMount() {
        var records = [];
        axios.get("/subjectrecords/" + this.props.subject.subjectId + "/false")
            .then((response) => {
                response.data.map((d, i) => {
                    d.displayName = d.sourceConceptName && d.sourceConceptName.length > 0 ?
                        d.sourceConceptName : d.conceptName;

                    if (d.displayName === "No matching concept") {
                        return null;
                    }
                    d.index = i;
                    d.key = 'rec' + i;
                    d.rawDate = new Date(d.startDate);
                    d.date = this.formatDate(d.rawDate);

                    d.searchName = d.displayName.toLowerCase();

                    d.dateOffset = this.getDateOffset(d.date);
                    d.prettyDate = this.prettyDate(d.date);
                    d.prettyDomain = this.capitalize(d.domain);

                    this.setState(prevState => (
                        {
                            minIndex: +d.dateOffset < prevState.minIndex ? +d.dateOffset : prevState.minIndex,
                            maxIndex: +d.dateOffset > prevState.minIndex ? + d.dateOffset : prevState.maxIndex
                        }
                    ));

                    d.type = 'record';
                    if (d.domain == 'drug') {
                        d.sourceConceptValue = "";
                    }

                    records.push(d);
                    return null;
                });
                axios.get("/subjectdocuments/" + this.props.subject.sourceValue + "/*:*")
                    .then((response) => {
                        if (response.data.documents) {
                            response.data.documents.map((d, i) => {
                                if (d.reportText.length === 0) {
                                    return null;
                                }
                                d.snippet = (d.snippet);
                                d.index = i;
                                d.key = 'doc'+ i;
                                d.rawDate = new Date(d.reportDate);
                                d.date = this.formatDate(d.rawDate);
                                d.reportText = (d.reportText);
                                d.searchName = '';

                                d.type = 'document';
                                d.dateOffset = this.getDateOffset(d.date);
                                d.prettyDate = this.prettyDate(d.date);

                                records.push(d);
                                return null;
                            });
                        }
                        records.sort((a,b) => {
                           return a.dateOffset - b.dateOffset;
                        });
                        this.setState(prevState => ({ records : records, loading:false }), () => {
                            this.origRecords = records;
                        });

                    }).catch(function (error) {
                    console.log(error);
                });
            }).catch(function (error) {
            console.log(error);
        });
    };

    render() {
        return (
            <div className="row" style={{padding:"0px 20px"}}>
                <div className="col-xs-12">
                    <div className="row">
                        <div className="col-md-2">
                            <div className="sidebar-nav-fixed affix">
                                <div>
                                    <button className="btn btn-primary btn-xs" onClick={() => {this.props.backToList()}}>&laquo; Back to List</button>
                                </div>
                                <div >
                                    <div align="center">
                                        <h3>Patient #{this.props.subject.sourceValue} <small>{this.state.loading ? <i className="fa fa-circle-o-notch fa-spin"></i> : <span></span>}</small></h3>
                                        {this.props.subject.age !== "" && this.props.subject.gender !== ""  ? <h5>{this.props.subject.age  + " yo " + this.props.subject.gender}</h5> : <div></div>}
                                    </div>
                                </div>
                                <div style={{marginTop: "10px"}}>
                                    <input className="form-control" onChange={this.handleFilterChange} placeholder="Type to filter.." type="text"/>

                                </div>
                            </div>
                        </div>
                        <div className="col-md-7">
                            <ChartData chartdata={this.state.records} />
                        </div>
                        <div className="col-md-3">
                            <div className="sidebar-nav-fixed pull-right affix">
                                <div >
                                    <button className="btn btn-xs btn-default" style={{float:"right"}} onClick={() => {this.props.navigateSubjects(1)}}>Next &raquo;</button>
                                    <button className="btn btn-xs btn-default" style={{float:"right"}} onClick={() => {this.props.navigateSubjects(-1)}}>&laquo; Previous</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}

export default SubjectDetail;
