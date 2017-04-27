import ReactDOM from 'react-dom';
import React from 'react';
import axios from 'axios';

import CohortList from './components/CohortList.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cohorts : []
    };
  }

  componentDidMount() {
    axios.get("/cohorts")
    .then((response) => {
      this.setState(prevState => ({
        cohorts : reponse.data
      }));
    })
    .catch((error) => {
      console.log(error);
    });
  };


  render () {
    return (
      <div className="container-fluid">
          <CohortList cohorts={this.state.cohorts}/>
      </div>

  );}
}

ReactDOM.render(<App/>, document.getElementById('app'));
