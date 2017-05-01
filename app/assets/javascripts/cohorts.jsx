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
  }

  componentDidMount() {
    axios.get("/cohorts").then((response) => {
      this.setState(prevState => ({cohorts: response.data}), () => {
        axios.get('/assets/data/mockAnnotationSet.json')
          .then(function (response) {
            var annotationSets = {};
            response.data.forEach((elem, index) => {
              if (!annotationSets[elem.cohort_id]) { annotationSets[elem.cohort_id] = []; }
              annotationSets[elem.cohort_id].push(elem);
            });
            console.log(annotationSets);
            this.setState(prevState => ({annotationSets: annotationSets}));
          })
          .catch(function (error) {
            console.log(error);
          });
      });
    }).catch((error) => {
      console.log(error);
    });
  };

  render() {
    return (
      <div className="container-fluid">
        <CohortList cohorts={this.state.cohorts}/>
      </div>

    );
  }
}

ReactDOM.render(
  <App/>, document.getElementById('app'));
