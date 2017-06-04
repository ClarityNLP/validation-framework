import React from 'react';
import {Table, Column, Cell} from 'fixed-data-table-2';

const TextCell = ({rowIndex, data, col, results, props}) => {
    const dataContent = data.getObjectAt(rowIndex);
    const subjectId = dataContent.subject_id;
    let displayContent = dataContent[col];

    if (col === 'comments') {
        if (results[subjectId] && results[subjectId].length > 0) {
            let comments = '';
            results[subjectId].forEach((r, i) => {
                if (r.comment && r.comment.length > 0) {
                    if (comments.length > 0) {
                        comments += ', ';
                    }
                    comments += r.comment;
                }
            });
            displayContent = comments;
        }
    } else if (col === 'completed') {
        if (results[subjectId] && results[subjectId].length > 0) {
            displayContent = "True";
        }
    }
    return (<Cell style={{width:"100%"}} >
        <div>{displayContent}</div>
    </Cell>);
};


class DataListWrapper {
    constructor(data) {
        this._cache = data;
        this._size = data.length;
    }

    getSize() {
        return this._size;
    }

    getObjectAt(index) {
        return this._cache[index];
    }
}

class ChartData extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            finalDataList : new DataListWrapper(props.entities)
        };
        this.onRowClick = this.onRowClick.bind(this);
    }

    componentWillReceiveProps(nextProps) {
    }

    onRowClick(target, index) {
        const data = this.state.finalDataList.getObjectAt(index);
        this.props.subjectSelected(index, data);
    }

    render() {
        let {finalDataList} = this.state;
        let {results} = this.props;
        return (
            <div>
                <Table
                    rowHeight={40}
                    rowsCount={finalDataList.getSize()}
                    headerHeight={40}
                    style={{marginTop:"5px"}}
                    width={this.props.width}
                    height={this.props.height}
                    onRowClick={this.onRowClick}
                    {...this.props}>
                    <Column
                        header={<Cell>#</Cell>}
                        cell={<TextCell data={finalDataList} col="sourceValue" results={results}   />}
                        width={100}
                    />
                    <Column
                        header={<Cell>Age</Cell>}
                        cell={<TextCell data={finalDataList} col="age" results={results}  />}
                        width={75}
                    />
                    <Column
                        header={<Cell>Gender</Cell>}
                        cell={<TextCell data={finalDataList} col="gender" results={results}   />}
                        width={75}
                    />
                    <Column
                        header={<Cell>Completed</Cell>}
                        cell={<TextCell data={finalDataList} col="completed"  results={results}  />}
                        width={200}
                    />
                    <Column
                        header={<Cell>Comments</Cell>}
                        cell={<TextCell data={finalDataList} col="comments" results={results} />}
                        width={300}
                    />
                </Table>
            </div>
        );
    };
}

export default ChartData;
