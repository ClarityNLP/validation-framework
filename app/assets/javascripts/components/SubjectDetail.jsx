import React from 'react';
import axios from 'axios';
import _ from 'lodash';
import $ from 'jquery';

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

const AnswerList = (props) => {
    return (
        <ul className="list-group">
            {props.answers.map(a => <li key={a.annotation_question_answer_id} className="list-group-item">
                <label> <input name={props.aName} value={a.value} answer-id={a.annotation_question_answer_id} type={props.qType === 'MULTIPLE_CHOICE' ? 'radio' : 'checkbox'}
                               onChange={props.handleInputChange} />{a.text}</label></li>)}
        </ul>
    )
};

const Question = (props) => {
    let qBody;
    const answerName = 'answer-' + props.annotation_question_id;
    const commentName = 'comment-' + props.annotation_question_id;

    switch(props.question_type) {
        case ('MULTIPLE_CHOICE'):
        case ('MULTIPLE_SELECT'):
            qBody =
                <AnswerList answers={props.answers} aName={answerName} qType={props.question_type} handleInputChange={props.handleInputChange} />;
            break;
        case ('NUMERIC'):
            qBody = <input name={answerName} type="number" className="form-control" onChange={props.handleInputChange} />;
            break;
        case ('DATE'):
            qBody = <input name={answerName} type="date" className="form-control" onChange={props.handleInputChange}  />;
            break;
        case ('TEXT'):
        default:
            qBody = <input name={answerName} type="text" className="form-control" onChange={props.handleInputChange}  />;
    }
    return (
        <div style={{marginTop:"30px"}}>
            <label>{props.index}. <b>{props.name}</b></label>
            {qBody}
            <a onClick={(e) => {$('#' + commentName).show(); $(e.target).hide();}}>Add comment&raquo;</a>
            <input name={commentName} id={commentName} type="text" className="form-control" style={{display:"none"}} onChange={props.handleInputChange} placeholder="Add comment..."></input>
        </div>
    )
};

const QuestionList = (props) => {
    return (
        <div style={{marginTop:"40px"}}>
            <form>
                {_.sortBy(props.questions, ['index']).map(q => <Question key={q.annotation_question_id} handleInputChange={props.handleInputChange}
                            index={q.index} name={q.question_name} answers={props.answers[q.annotation_question_id]} {...q}/>) }
                <a style={{marginTop:"15px"}} type="submit" className="btn btn-success" onClick={props.submitAnswers}>Submit</a>
            </form>
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


    getObjectAt(index) {
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
            for (let i = 0; i < this.size; i++) {
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
        this.handleInputChange = this.handleInputChange.bind(this);
        this.submitAnswers = this.submitAnswers.bind(this);

        this.maxIndex = 0;
        this.minIndex = 0;
        this.dataStore = new DataStore([]);
    }

    submitAnswers(e) {
        const setId = +this.props.setId;
        const subjectId = this.props.subject.subjectId + "";
        const documentId = '';
        const userId = +document.getElementById("uid").value;
        this.props.questions.forEach((q) => {
            const qId = q.annotation_question_id;
            const answerValue = this.state['answer-' + qId] || '';
            const commentValue = this.state['comment-' + qId] || '';
            const pk = -1;
            let answerId = null;
            if (this.props.answers[qId] && this.props.answers[qId].length > 0) {
                this.props.answers[qId].forEach(a => {
                    if (a.value === answerValue) {
                        answerId = a.annotation_question_answer_id;
                    }
                });
            }
            const answer = {
                annotation_set_result_id : pk,
                annotation_set_id : setId,
                comment : commentValue,
                annotation_question_answer_id : answerId,
                subject_id : subjectId,
                user_id : userId,
                document_id : documentId,
                annotation_question_id : qId,
                answer_text : answerValue
            };

            axios.post('/annotation_set/result', answer)
                .then((res) => {
                    console.log(res);
                })
                .catch((err) => {
                    console.log(err);
                });
        });

    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    formatDate(d) {
        return d.toISOString().slice(0, 10);
    };

    prettyDate(dString) {
        const d = Date.parse(dString);
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
            const curDate = Date.parse(d);
            const indexDate = Date.parse(this.props.subject.indexDate);
            return Date.daysBetween(indexDate, curDate);
        }
    };

    updateDimensions() {
        const element = document.getElementById('chart-data-div');
        const positionInfo = element.getBoundingClientRect();
        const height = (window.innerHeight - 170) || positionInfo.height;
        const width = +positionInfo.width - 20;
        this.setState(prevState => ({ chartWidth : width, chartHeight : height }));
    };

    sort(sortDir, columnKey, secondaryColumnKey) {
        const sorted = this.dataStore._cache.slice();

        sorted.sort((indexA, indexB) => {
            const valueA = indexA[columnKey];
            const valueB = indexB[columnKey];

            const valueA2 = indexA[secondaryColumnKey];
            const valueB2 = indexB[secondaryColumnKey];

            let sortVal = valueA === valueB ? 0 : valueA < valueB ? -1 : 1;

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
        const filterMap = this.state.filters;
        Object.keys(filterMap).forEach((f) => filterMap[f].checked = (which === 'all'));
        this.setState(prevState => ({ filters : filterMap }));
    }

    handleFilterChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        let filterMap = this.state.filters;
        filterMap[name].checked = value;

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
                        <div id="chart-data-div" className="col-md-8" style={{borderRight:"3px solid #d3d3d3", height:"100%"}}>
                            { this.state.loading ? <div style={{marginTop:"40px"}} align="center"><span><i className="fa fa-circle-o-notch fa-spin"></i></span>  Loading...</div> :
                                <ChartData chartdata={this.state.chartData} height={this.state.chartHeight}
                                           width={this.state.chartWidth} filters={this.state.filters} goToDay={this.state.goToDay}
                                           setDomainCounts={this.setDomainCounts} setTotalCount={this.setTotalCount}
                                />
                            }
                        </div>
                        <div className="col-md-2" >
                            <div className="pull-right">
                                <div >
                                    <button className="btn btn-sm btn-default" style={{float:"right"}} onClick={() => {this.props.navigateSubjects(1)}}>Next &raquo;</button>
                                    <button className="btn btn-sm btn-default" style={{float:"right"}} onClick={() => {this.props.navigateSubjects(-1)}}>&laquo; Previous</button>
                                </div>
                            </div>
                            { (this.props.viewOnly || this.state.loading) ? <span></span> :
                                <div>
                                    <QuestionList questions={this.props.questions} answers={this.props.answers} submitAnswers={this.submitAnswers}
                                                  handleInputChange={this.handleInputChange} results={this.props.results} />
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
