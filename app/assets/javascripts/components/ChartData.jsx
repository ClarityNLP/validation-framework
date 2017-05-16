import React from 'react';
import {Table, Column, Cell} from 'fixed-data-table-2';

const TextCell = ({rowIndex, data, col, props}) => {
    var dataContent = data.getObjectAt(rowIndex);
    let contents;
    let className = 'col-' + col;
    if (dataContent.type === 'document' && col === 'displayName') {
        contents = <pre>{dataContent[col]}</pre>
    } else {
        contents = <span>{dataContent[col]}</span>
    }

    return (<Cell className={className}>
        {contents}
    </Cell>);
};


class DataListWrapper {
    constructor(indexMap, data) {
        this._indexMap = indexMap;
        this._data = data;
    }

    getSize() {
        return this._indexMap.length;
    }

    getObjectAt(index) {
        return this._data.getObjectAt(
            this._indexMap[index],
        );
    }
}

class ChartData extends React.Component {

    constructor(props) {
        super(props);
        this._dataList = props.chartdata;
        this.state = {
            filteredDataList: this._dataList
        };
        this.fillerText = '                                                                      ';
        this._onFilterChange = this._onFilterChange.bind(this);
        this._rowHeightGetter = this._rowHeightGetter.bind(this);
    }


    _onFilterChange(e) {
        if (!e.target.value) {
            this.setState({
                filteredDataList: this._dataList,
            });
        }

        var filterBy = e.target.value.toLowerCase();
        var size = this._dataList.getSize();
        var filteredIndexes = [];
        for (var index = 0; index < size; index++) {
            var {displayName} = this._dataList.getObjectAt(index);
            if (displayName.toLowerCase().indexOf(filterBy) !== -1) {
                filteredIndexes.push(index);
            }
        }

        this.setState({
            filteredDataList: new DataListWrapper(filteredIndexes, this._dataList),
        });
    }

    _rowHeightGetter(index) {
        var obj = this.state.filteredDataList.getObjectAt(index);
        if (obj) {
            if (obj.type === 'document') {
                return (Math.round(obj.displayName.replace(/\n/g, this.fillerText).length / 65) * 26) + 22
            } else {
                return Math.max(Math.round(obj.displayName.length / 65) * 28, 36);
            }
        } else {
            return 0;
        }
    }

    render() {
        var {filteredDataList} = this.state;
        return (
            <div>
                <div>
                    <input className="form-control"
                        onChange={this._onFilterChange}
                        placeholder="Filter"
                    />
                </div>
                <br />
                <Table
                    rowHeightGetter={this._rowHeightGetter}
                    rowHeight={40}
                    rowsCount={filteredDataList.getSize()}
                    headerHeight={40}
                    width={this.props.width}
                    height={this.props.height}
                    {...this.props}>
                    <Column
                        header={<Cell>Day</Cell>}
                        cell={<TextCell data={filteredDataList} col="dateOffset" />}
                        fixed={true}
                        width={40}
                    />
                    <Column
                        header={<Cell>Date</Cell>}
                        cell={<TextCell data={filteredDataList} col="prettyDate" />}
                        fixed={true}
                        width={75}
                    />
                    <Column
                        header={<Cell>Code</Cell>}
                        cell={<TextCell data={filteredDataList} col="sourceConceptValue" />}
                        width={100}
                    />
                    <Column
                        header={<Cell>Name</Cell>}
                        cell={<TextCell data={filteredDataList} col="displayName" style={{fontWeight:"bold"}} />}
                        width={300}
                        flexGrow={2}
                    />
                    <Column
                        header={<Cell>Value</Cell>}
                        cell={<TextCell data={filteredDataList} col="displayValue" />}
                        width={100}
                    />
                </Table>
            </div>
        );
    };
}

export default ChartData;
