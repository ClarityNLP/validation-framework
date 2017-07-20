import ReactDOM from 'react-dom';
import React from 'react';
import axios from 'axios';

import CohortList from './components/CohortList.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        cohorts: [],
        adminCohorts : {}
    };

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    axios.get("/cohorts_ohdsi").then((response) => {
      let cohorts = response.data.map((c) => {
          c.cohort_type = 'WebAPI';
          c.comment = '';
          return c;
      });
      axios.get("cohorts_local").then((response) => {
          if (response && response.data.length > 0) {
              response.data.map((c) => {
                  c.createdDate = c.date_created;
                  c.modifiedDate = c.date_updated;
                  c.name = c.validation_local_cohort_name;
                  c.id = c.validation_local_cohort_def_id;
                  c.createdBy = c.owner;
                  cohorts.push(c);
                  return null;
              });
          }
          const uname = document.getElementById("uname").value;
          axios.get('/annotation_set/name/'  + uname)
              .then((response) => {
                  const annotationSets = {};
                  response.data.forEach((elem, index) => {
                      if (!annotationSets[elem.cohort_id]) { annotationSets[elem.cohort_id] = []; }
                      annotationSets[elem.cohort_id].push(elem);
                  });
                  cohorts.forEach((elem, index) => {
                      let cohort = elem;
                      if (annotationSets[elem.id]) {
                          elem.annotationSets = annotationSets[elem.id].map((item) => {
                              if (item.cohort_source === elem.cohort_type) {
                                  item.url = "/cohortdetails/?viewOnly=false&cohortId=" + cohort.id + "&setId=" + item.annotation_set_id + "&cohortType=" + cohort.cohort_type;
                                  return item;
                              } else {
                                  return null;
                              }
                          });
                      } else {
                          elem.annotationSets = [];
                      }
                      elem.viewUrl = "/cohortdetails/?viewOnly=true&cohortId=" + cohort.id + "&cohortType=" + cohort.cohort_type;
                  });
                  axios.get('/annotation_set/owner/' + uname)
                      .then((response) => {
                          const adminCohorts = {};
                          response.data.forEach((c, i) => {
                              if (!adminCohorts[c.cohort_id]) { adminCohorts[c.cohort_id] = []; }
                              adminCohorts[c.cohort_id].push(c);
                          });
                          this.setState(prevState => (
                              {
                                  adminCohorts: adminCohorts
                              }
                          ));
                      })
                      .catch(function (error) {
                          console.log(error);
                      });
                  this.setState(prevState => (
                      {
                          cohorts: cohorts,
                          fullCohorts : cohorts
                      }
                  ));
              })
              .catch(function (error) {
                  console.log(error);
              });
      })
      .catch(function (error) {
          console.log(error);
      });
    }).catch((error) => {
      console.log(error);
    });
  };

  handleChange(event) {
      const val = event.target.value.toLowerCase();
      if (val.trim() === "") {
          this.setState(prevState =>
              ({
                  cohorts: prevState.fullCohorts
              }));
      } else {
          this.setState(prevState =>
              ({
                  cohorts: prevState.fullCohorts.filter((c) => {
                      return c.name ? c.name.toLowerCase().includes(val) : false;
                  })
              }));
      }
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-xs-12">
            <input className="form-control" type="text" placeholder="Type to filter..." onChange={this.handleChange} />
          </div>
        </div>
        <CohortList cohorts={this.state.cohorts} adminCohorts={this.state.adminCohorts}/>
      </div>

    );
  }
}

ReactDOM.render(
  <App/>, document.getElementById('app'));
