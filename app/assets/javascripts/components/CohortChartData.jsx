import React from 'react';
import {Table, Column, Cell} from 'fixed-data-table-2';

import DataListWrapper from './DataListWrapper.jsx';

const TextCell = ({rowIndex, data, col, results, props}) => {
    const dataContent = data.getObjectAt(rowIndex);
    const subjectId = dataContent.subject_id;
    let displayContent = dataContent[col];
    let completed = false;

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
            displayContent = "YES";
            completed = true;
        } else {
            displayContent = "NO";
        }
    }

    const className = completed ? "clickrow clickrow-completed" : "clickrow";
    return (<Cell style={{width:"100%"}} >
        <div className={className}>{displayContent}</div>
    </Cell>);
};


class ChartData extends React.Component {

    constructor(props) {
        super(props);
        this._dataList = props.entities;
        let filteredList = this.doFilter(this._dataList, '');
        this.totalCount = filteredList.totalCount;

        this.state = {
            filteredDataList : new DataListWrapper(filteredList.filteredIndexes, this._dataList),
            filterBy : ''
        };
        this.onRowClick = this.onRowClick.bind(this);
        this._onFilterChange = this._onFilterChange.bind(this);
        this.doFilter = this.doFilter.bind(this);
    }

    componentWillReceiveProps(nextProps) {
    }

    onRowClick(target, index) {
        const data = this.state.filteredDataList.getObjectAt(index);
        this.props.subjectSelected(index, data);
    }


    _onFilterChange(e) {
        if (!e.target.value) {
            this.setState({
                filteredDataList: this._dataList,
            });
        }

        const filterBy = e.target.value.toLowerCase();
        const filtered = this.doFilter(this._dataList, filterBy);
        this.totalCount = filtered.totalCount;

        this.setState({
            filterBy : filterBy,
            filteredDataList: new DataListWrapper(filtered.filteredIndexes, this._dataList)
        });
    }

    doFilter(dataList, filterText) {
        const size = dataList.getSize();
        let filteredIndexes = [];
        let filteredIndex = -1;
        let totalCount = 0;
        for (let index = 0; index < size; index++) {
            const obj = dataList.getObjectAt(index);

            if (obj) {
                const {sourceValue, subjectId, comment, gender} = obj;

                if ((subjectId + "").toLowerCase().indexOf(filterText) !== -1
                    || (sourceValue + "").toLowerCase().indexOf(filterText) !== -1
                    || (comment || "").toLowerCase().indexOf(filterText) !== -1
                    || (gender || "").toLowerCase().indexOf(filterText) !== -1) {
                    filteredIndexes.push(index);
                    filteredIndex++;

                    totalCount++;
                }
            }

        }

        return {
            filteredIndexes : filteredIndexes,
            totalCount : totalCount
        };
    }

    render() {
        let {filteredDataList} = this.state;
        let {results} = this.props;
        return (
            <div>
                <div>
                    <input
                        className="form-control"
                        onChange={this._onFilterChange}
                        placeholder="Filter..."
                    />
                </div>
                <Table
                    rowHeight={40}
                    rowsCount={filteredDataList.getSize()}
                    headerHeight={40}
                    style={{marginTop:"5px"}}
                    width={this.props.width}
                    height={this.props.height}
                    onRowClick={this.onRowClick}
                    {...this.props}>
                    <Column
                        header={<Cell>#</Cell>}
                        cell={<TextCell data={filteredDataList} col="sourceValue" results={results}   />}
                        width={70}
                    />
                    <Column
                        header={<Cell>ID</Cell>}
                        cell={<TextCell data={filteredDataList} col="subject_id" results={results}   />}
                        width={70}
                    />
                    <Column
                        header={<Cell>Age</Cell>}
                        cell={<TextCell data={filteredDataList} col="age" results={results}  />}
                        width={75}
                    />
                    <Column
                        header={<Cell>Gender</Cell>}
                        cell={<TextCell data={filteredDataList} col="gender" results={results}   />}
                        width={75}
                    />
                    <Column
                        header={<Cell>Completed</Cell>}
                        cell={<TextCell data={filteredDataList} col="completed"  results={results}  />}
                        width={200}
                    />
                    <Column
                        header={<Cell>Comments</Cell>}
                        cell={<TextCell data={filteredDataList} col="comments" results={results} />}
                        width={300}
                    />
                </Table>
            </div>
        );
    };
}

export default ChartData;
