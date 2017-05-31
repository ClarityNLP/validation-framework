import ReactDOM from 'react-dom';
import React from 'react';
import axios from 'axios';

import CohortEntityList from './components/CohortEntityList.jsx';
import SubjectDetail from './components/SubjectDetail.jsx';

var QueryString = function () {
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
            query_string[pair[0]] = arr;
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
            questions : {},
            answers : {},
            results : {}
        };

        this.subjectSelected = this.subjectSelected.bind(this);
        this.subjectSelectedByIndex = this.subjectSelectedByIndex.bind(this);
        this.backToList = this.backToList.bind(this);
        this.navigateSubjects = this.navigateSubjects.bind(this);
        this.updateAnswers = this.updateAnswers.bind(this);
    }

    componentDidMount() {
        console.log(QueryString);
        const cohortId = QueryString.cohortId;
        const setId = QueryString.setId || -1;
        const viewOnly = QueryString.viewOnly === 'true';
        if (cohortId) {
            this.setState(prevState => (
                {
                    cohortId: cohortId,
                    setId : setId,
                    viewOnly : viewOnly
                }));
            axios.get("/cohort/" + cohortId)
                .then((response) => {
                    this.setState(prevState => ({cohort : response.data}));
                }).catch(function (error) {
                console.log(error);
            });
            axios.get("/cohortentities/" + cohortId)
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
                        d.completed = "";
                        d.status = "";
                        d.comments = "";
                        d.indexDate = d.cohortStartDate;
                        d.url = "/chart";
                        return d;
                    });
                    this.setState(prevState => ({
                        entities: entities,
                        length : entities.length,
                        ready : true
                    }));
                })
                .catch(function (error) {
                    console.log(error);
                });
            if (setId !== -1) {
                axios.get("/annotation_set/question/" + setId)
                    .then((response) => {
                    console.log(response.data);
                        this.setState(prevState => ({
                            questions : response.data,
                            answers : {}
                        }));
                        response.data.forEach((q) => {

                            axios.get("/annotation_question_answer/" + q.annotation_question_id)
                                .then((response) => {
                                    console.log(response.data)
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

    subjectSelected(index, subject) {
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
        if (this.state.length > 0) {
            let currentIndex = this.state.currentIndex + offset;
            if (currentIndex < 0) {
                currentIndex = this.state.length - 1;
            } else if (currentIndex > (this.state.length - 1)) {
                currentIndex = 0;
            }
            this.subjectSelectedByIndex(currentIndex);
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
                                              viewOnly={this.state.viewOnly}
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
                            />
                    }
            </div>

        );
    }
}

ReactDOM.render(
    <CohortDetails/>, document.getElementById('list'));
