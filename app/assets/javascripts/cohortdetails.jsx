import ReactDOM from 'react-dom';
import React from 'react';
import axios from 'axios';

import CohortEntityList from './components/CohortEntityList.jsx';

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
            cohort : {}
        };
    }

    componentDidMount() {
        console.log(QueryString);
        var cohortId = QueryString.cohortId;
        var setId = QueryString.setId;
        if (cohortId && setId) {
            this.setState(prevState => (
                {
                    cohortId: cohortId,
                    setId : setId
                }));
            axios.get("/cohort/" + cohortId)
                .then((response) => {
                    this.setState(prevState => ({cohort : response.data}));
                }).catch(function (error) {
                console.log(error);
            });
            axios.get("/cohortentities/" + cohortId)
                .then((response) => {
                    this.setState(prevState => ({
                        entities: response.data.map((d) => {
                            if (d.demographics) {
                                d.gender = d.demographics.gender;
                                d.age = d.demographics.age;
                            } else {
                                d.gender = "";
                                d.age = "";
                            }
                            return d;
                        })
                    }));
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    };

    render() {
        return (
            <div className="container-fluid">
                <div>
                    <a className="btn btn-sm btn-default" href="/cohortview">&laquo; Back</a>
                </div>
                <div>
                    <h2>{this.state.cohort.name}</h2>
                </div>
                <CohortEntityList entities={this.state.entities} cohort={this.state.cohort} />
            </div>
        );
    }
}

ReactDOM.render(
    <CohortDetails/>, document.getElementById('list'));
