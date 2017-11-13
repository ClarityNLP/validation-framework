import React from 'react';
import _ from 'lodash';

const AnnotationSetButton = (props) => {
    let btn =
        <div className="btn-group">
            <button type="button" className="btn btn-success btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Annotate <span className="caret"></span>
            </button>

            <ul className="dropdown-menu">
                {props.cohort.annotationSets.map(set => (
                    set !== null && set.name ?
                        <li key={set.name} {...set}><a href={set.url}>{set.name}</a></li> : <li/>
                ))}
            </ul>
        </div>;
    return (btn);
};

const AdminButton = (props) => {
    let btn =
        <div className="btn-group">
            <button type="button" className="btn btn-info btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Download <span className="caret"></span>
            </button>

            <ul className="dropdown-menu">
                {props.admin.map(a => (
                    a !== null && a.name ?
                        <li key={a.name} {...a}><a href={'/download_result/' + a.annotation_set_id}>{a.name}</a></li> :
                        <li/>
                ))}
            </ul>
        </div>;
    return (btn);
};

class CohortList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cohorts : []
        };
    }

    componentWillReceiveProps(nextProps) {
        // if (nextProps.cohorts && nextProps.cohorts.length !== this.state.cohorts.length) {
        //     const newCohorts = nextProps.cohorts.filter((c) => {
        //         let isAdmin = false;
        //         const admin = nextProps.adminCohorts[c.id];
        //         if (admin) {
        //             admin.map((a) => {
        //                 if (a.cohort_source === c.cohort_type) {
        //                     isAdmin = true;
        //                 }
        //                 return null;
        //             });
        //         }
        //         return c.annotationSets.length > 0 || isAdmin;
        //     });
        //     this.setState({
        //         cohorts : newCohorts
        //     })
        //
        // }
        // TODO more cleanup and testing - this filter was for UCB, but we want to see 'ALL'
        this.setState({
            cohorts : _.sortBy(nextProps.cohorts, ['name'])
        })
    }

    render() {

        return (
            <div className="row" style={{padding:"0px 20px"}}>
                <table className="table table-striped table-hover">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Annotate</th>
                        <th>View</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Admin</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.cohorts.map((cohort) => {
                        const admin = this.props.adminCohorts[cohort.id];
                        return (

                            <tr key={cohort.id} onClick={() => {window.location.url = cohort.viewUrl}} style={{
                                verticalAlign : "middle",
                                cursor: "pointer"
                            }}>
                                <td>{cohort.id}</td>
                                <td>
                                    {cohort.annotationSets && cohort.annotationSets.length > 0 ?
                                        <AnnotationSetButton cohort={cohort} />
                                        : <div></div>
                                    }
                                </td>
                                <td>
                                    <a className="btn btn-xs btn-primary" href={cohort.viewUrl}>View</a>
                                </td>
                                <td>{cohort.name}</td>
                                <td>{cohort.description}</td>
                                <td>{cohort.createdDate}</td>
                                <td>
                                    {admin && admin.length > 0 ?
                                        <AdminButton cohort={cohort} admin={admin} />
                                        : <div></div>
                                    }
                                </td>
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
