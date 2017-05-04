import React from 'react';
import axios from 'axios';
import _ from 'lodash';

import ChartData from './ChartData.jsx';

class DataStore {
    constructor() {
        this.curIndex = 0;
        this._cache = [];
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
            chartWidth: 400
        };

        this.maxIndex = 0;
        this.minIndex = 0;
        this.dataStore = new DataStore();
        this.formatDate = this.formatDate.bind(this);
        this.prettyDate = this.prettyDate.bind(this);
        this.formatLongDate = this.formatLongDate.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
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
        var height = positionInfo.height;
        var width = +positionInfo.width - 20;
        this.setState(prevState => ({ chartWidth : width }));
        console.log(width);
    };

    componentWillMount() {
    };

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
        this.updateDimensions();
    }

    componentDidMount() {
        window.addEventListener("resize", this.updateDimensions);

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
                                d.rawDate = new Date(d.reportDate);
                                d.date = this.formatDate(d.rawDate);

                                d.type = 'document';
                                d.dateOffset = this.getDateOffset(d.date);
                                d.prettyDate = this.prettyDate(d.date);

                                // TODO
                                return null;
                            });
                        }

                        this.setState(prevState => ({ loading:false }));

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
                                </div>
                            </div>
                        </div>
                        <div id="chart-data-div" className="col-md-7">
                            { this.state.loading ? <div> </div> :
                                <ChartData chartdata={this.dataStore} height={this.state.chartHeight}
                                           width={this.state.chartWidth}/>
                            }
                        </div>
                        <div className="col-md-3">
                            <div className="sidebar-nav-fixed pull-right affix">
                                <div >
                                    <button className="btn btn-xs btn-default" onClick={() => {this.props.navigateSubjects(1)}}>Next &raquo;</button>
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
