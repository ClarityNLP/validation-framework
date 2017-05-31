import ReactDOM from 'react-dom';
import React from 'react';
import axios from 'axios';

import CohortList from './components/CohortList.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cohorts: []
    };

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    axios.get("/cohorts").then((response) => {
      var cohorts = response.data;
      var uid = document.getElementById("uid").value;
      axios.get('/annotation_set/name/'  + uid)
        .then((response) => {
          var annotationSets = {};
          response.data.forEach((elem, index) => {
            if (!annotationSets[elem.cohort_id]) { annotationSets[elem.cohort_id] = []; }
            annotationSets[elem.cohort_id].push(elem);
          });
          cohorts.forEach((elem, index) => {
            var cohort = elem;
            if (annotationSets[elem.id]) {
              var sets = annotationSets[elem.id].map((item) => {
                item.url = "/cohortdetails/?viewOnly=false&cohortId=" + cohort.id + "&setId=" + item.annotation_set_id;
                return item;
              });
              elem.annotationSets = sets
            } else {
              elem.annotationSets = [];
            }
            elem.viewUrl = "/cohortdetails/?viewOnly=true&cohortId=" + cohort.id
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
        <CohortList cohorts={this.state.cohorts}/>
      </div>

    );
  }
}

ReactDOM.render(
  <App/>, document.getElementById('app'));
