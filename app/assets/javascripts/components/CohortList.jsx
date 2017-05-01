import React from 'react';

class CohortList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cohorts: []
    };
    this.cohortButton = this.cohortButton.bind(this);
  }

  cohortButton(props, cohort) {
    let btn;
      if (props.annotationSets[cohort.id]) {
      btn =(<div className="btn-group">
        <button type="button" className="btn btn-default dropdown-toggle" dataToggle="dropdown" ariaHaspopup="true" ariaExpanded="false">
          Action <span className="caret"></span>
        </button>
        <ul className="dropdown-menu">
          <li><a href="#">Action</a></li>
        </ul>
      </div>)
      } else {
        (<div></div>)
      }
  }

  render() {

    return (
      <div className="row" style={{padding:"0px 20px"}}>
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Description</th>
              <th>Date</th>
              <th>...</th>
            </tr>
          </thead>
          <tbody>
            {this.props.cohorts.map((cohort) => {
              return (
                <tr key={cohort.id} style={{
                  cursor: "pointer"
                }}>
                  <td>{cohort.id}</td>
                  <td>{cohort.name}</td>
                  <td>{cohort.description}</td>
                  <td>{cohort.createdDate}</td>
                  <td>...</td>
                </tr>
              )
            })
           }
          </tbody>
        </table>
      </div>
    );
  };
}

export default CohortList;
