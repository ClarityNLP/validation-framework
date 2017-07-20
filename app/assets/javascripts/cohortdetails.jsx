import ReactDOM from 'react-dom';
import React from 'react';
import axios from 'axios';

import CohortEntityList from './components/CohortEntityList.jsx';
import SubjectDetail from './components/SubjectDetail.jsx';

const QueryString = function () {
    const query_string = {};
    const query = window.location.search.substring(1);
    const vars = query.split("&");
    for (let i=0;i<vars.length;i++) {
        const pair = vars[i].split("=");
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
        } else if (typeof query_string[pair[0]] === "string") {
            query_string[pair[0]] = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}();

class CohortDetails extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            entities: [],
            length : 0,
            cohort : {},
            mode : "list-view",
            subject : {},
            ready : false,
            currentIndex : 0,
            cohortId : -1,
            setId : -1,
            questions : [],
            answers : {},
            results : {}
        };

        this.subjectSelected = this.subjectSelected.bind(this);
        this.subjectSelectedByIndex = this.subjectSelectedByIndex.bind(this);
        this.backToList = this.backToList.bind(this);
        this.navigateSubjects = this.navigateSubjects.bind(this);
        this.updateAnswers = this.updateAnswers.bind(this);
        this.updateResults = this.updateResults.bind(this);
    }

    componentDidMount() {
        //console.log(QueryString);
        const cohortId = QueryString.cohortId;
        const setId = QueryString.setId || -1;
        const viewOnly = QueryString.viewOnly === 'true';
        const cohortType = QueryString.cohortType;
        if (cohortId) {
            this.setState(prevState => (
                {
                    cohortId: cohortId,
                    setId : setId,
                    viewOnly : viewOnly
                }));
            axios.get("/cohort/" + cohortId + "/" + cohortType)
                .then((response) => {
                    const cohortDef = response.data;
                    if (cohortType === "LOCAL") {
                        cohortDef.createdDate = cohortDef.date_created;
                        cohortDef.modifiedDate = cohortDef.date_updated;
                        cohortDef.name = cohortDef.validation_local_cohort_name;
                        cohortDef.id = cohortDef.validation_local_cohort_def_id;
                        cohortDef.createdBy = cohortDef.owner;
                    }
                    this.setState(prevState => ({cohort : cohortDef}));
                }).catch(function (error) {
                console.log(error);
            });
            axios.get("/cohortentities/" + cohortId + "/" + cohortType)
                .then((response) => {

                    const entities = response.data.map((d, index) => {
                        d.index = index;
                        if (d.demographics) {
                            d.gender = d.demographics.gender;
                            d.age = d.demographics.age;
                            d.sourceValue = d.demographics.personSourceValue;
                        } else {
                            d.gender = "";
                            d.age = "";
                            d.sourceValue = "";
                        }
                        if (!d.subject_id && d.subjectId) {
                            d.subject_id = d.subjectId;
                        }
                        if (!d.subjectId && d.subject_id) {
                            d.subjectId = d.subject_id;
                        }
                        d.completed = "False";
                        d.indexDate = d.start_date ? d.start_date : d.cohortStartDate;
                        return d;
                    });

                    const uname = document.getElementById("uname").value;
                    axios.get("/annotation_set/name/" + uname + "/id/" + setId)
                        .then((response) => {
                            const results = {};
                            response.data.forEach((r) => {
                                if (!results[r.subject_id]) {
                                    results[r.subject_id] = [];
                                }
                                results[r.subject_id].push(r);
                            });
                            this.setState(prevState => ({
                                results : results
                            }));
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                    this.setState(prevState => ({
                        entities: entities,
                        length : entities.length,
                        ready : true
                    }), () => {
                        if (cohortType === "LOCAL") {
                            axios.get("/cohortdemographics/" + cohortId)
                                .then((response) => {
                                    if (response.data) {
                                        const demEntities = this.state.entities.map((d) => {
                                            const k = d.subject_id + "";
                                            const demographics = response.data[k];
                                            if (demographics) {
                                                d.gender = demographics.gender;
                                                d.age = demographics.age;
                                                d.sourceValue = demographics.personSourceValue;
                                            }
                                            return d;
                                        });
                                        this.setState(prevState => ({
                                            entities: demEntities
                                        }));
                                    }
                                })
                                .catch(function (error) {
                                    console.log(error);
                                });
                        }
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
            if (setId !== -1) {
                axios.get("/annotation_set/question/" + setId)
                    .then((response) => {
                        this.setState(prevState => ({
                            questions : response.data,
                            answers : {}
                        }));
                        response.data.forEach((q) => {

                            axios.get("/annotation_question_answer/" + q.annotation_question_id)
                                .then((response) => {
                                    this.setState(prevState => ({
                                        answers : this.updateAnswers(prevState.answers, q, response.data)
                                    }));
                                })
                                .catch(function (error) {
                                    console.log(error);
                                });
                        });
                    })
                    .catch(function (error) {
                        console.log(error);
                    });

            }
        }

    };

    updateAnswers(obj, q, answerList) {
        obj[q.annotation_question_id] = answerList;
        return obj;
    }

    updateResults(subjectId, subjectResults) {
        const results = this.state.results;
        results[subjectId] = subjectResults;
        this.setState(prevState => (
            {
                results : results
            }));
    }

    subjectSelected(index, subject) {
        console.log(subject);
        this.setState(prevState => (
            {
                currentIndex : index,
                mode : "subject-view",
                subject : subject
            }));
    }


    subjectSelectedByIndex(index) {
        if (index >= 0 && index < this.state.length) {
            const subject = this.state.entities[index];
            this.subjectSelected(index, subject);
        }
    }

    backToList() {
        this.setState(prevState => (
            {
                mode : "list-view",
                subject : {}
            }));
    }

    navigateSubjects(offset) {
        let reset = false;
        if (this.state.length > 0) {
            let currentIndex = this.state.currentIndex + offset;
            if (currentIndex < 0 || (currentIndex > (this.state.length - 1))) {
                reset = true;
            }
            if (reset) {
                this.backToList();
            } else {
                this.subjectSelectedByIndex(currentIndex);
            }

        }
    };

    render() {
        return (

            <div className="container-fluid">
                {this.state.mode === "list-view"
                    ?
                    <div>
                        <div>
                            <a className="btn btn-sm btn-default" href="/cohortview">&laquo; Back</a>
                        </div>
                        <div>
                            <h2>{this.state.cohort.name} <small>({this.state.entities.length} Subjects)</small></h2>
                        </div>
                        {this.state.ready ?
                            <CohortEntityList entities={this.state.entities} cohort={this.state.cohort}
                                              viewOnly={this.state.viewOnly} results={this.state.results}
                                              subjectSelected={this.subjectSelected}
                            /> : <div><h4 style={{color:"grey"}}>Loading...</h4></div>
                        }
                    </div>
                    :
                        <SubjectDetail subject={this.state.subject} backToList={this.backToList}
                                       viewOnly={this.state.viewOnly}
                                       navigateSubjects={this.navigateSubjects}
                                       questions={this.state.questions}
                                       answers={this.state.answers}
                                       results={this.state.results}
                                       cohortId={this.state.cohortId}
                                       setId={this.state.setId}
                                       length={this.state.length}
                                       currentIndex={this.state.currentIndex}
                                       updateResults={this.updateResults}
                            />
                    }
            </div>

        );
    }
}

ReactDOM.render(
    <CohortDetails/>, document.getElementById('list'));
