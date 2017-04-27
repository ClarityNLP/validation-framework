import React from 'react';

class CohortList extends React.Component {
  render() {
    return (
      <div className="row">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Description</th>
              <th>Date</th>
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
