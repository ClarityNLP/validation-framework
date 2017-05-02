import React from 'react';

class ChartData extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <div>
                <table className="table">
                    <colgroup>
                        <col style={{width:"5%"}}></col>
                        <col style={{width:"10%"}}></col>
                        <col style={{width:"10%"}}></col>
                        <col style={{width:"60%"}}></col>
                        <col style={{width:"15%"}}></col>
                    </colgroup>
                    <thead>
                    <tr>
                        <th>Day</th>
                        <th>Date</th>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Value</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.props.chartdata.map((c) => {
                        if (c.type === 'record') {
                            return (
                                <tr key={c.key}>
                                    <td>{c.dateOffset}</td>
                                    <td>{ c.prettyDate}</td>
                                    <td>{ c.sourceConceptValue }</td>
                                    <td>{ c.displayName }</td>
                                    <td>{ c.displayValue }</td>
                                </tr>
                            )
                        } else {
                            return (
                                <tr key={c.key }>
                                    <td colSpan="5"><pre>{c.reportText}</pre></td>
                                </tr>
                            )
                        }
                    })}
                    </tbody>
                </table>

            </div>
        );
    };
}

export default ChartData;
