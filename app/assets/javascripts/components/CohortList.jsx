import React from 'react';

const AnnotationSetButton = (props) => {
    console.log(props);
    let btn =
        <div className="btn-group">
            <button type="button" className="btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Annotate <span className="caret"></span>
            </button>

            <ul className="dropdown-menu">
                {props.cohort.annotationSets.map(set => (
                    <li key={set.name} {...set}><a href={set.url}>{set.name}</a></li>
                ))}
            </ul>
        </div>;
    return (btn);
};

class CohortList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cohorts: []
        };
    }

    render() {
        return (
            <div className="row" style={{padding:"0px 20px"}}>
                <table className="table table-striped table-hover">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Action</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.props.cohorts.map((cohort) => {
                        return (
                            <tr key={cohort.id} style={{
                                verticalAlign : "middle",
                                cursor: "pointer"
                            }}>
                                <td>{cohort.id}</td>
                                <td>
                                    {cohort.annotationSets.length > 0 ?
                                        <AnnotationSetButton cohort={cohort} />
                                        : <div></div>
                                    }
                                </td>
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
