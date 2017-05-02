import React from 'react';


class CohortEntityList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div className="row" style={{padding:"0px 20px"}}>
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Completed</th>
              <th>Status</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {this.props.entities.map((p) => {
              return (
                <tr key={p.subjectId} style={{
                  verticalAlign : "middle",
                  cursor: "pointer"

                }}
                onClick={()=>this.props.subjectSelected(p)}>
                  <td>{p.sourceValue}</td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td></td>
                  <td></td>
                  <td></td>
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

export default CohortEntityList;
