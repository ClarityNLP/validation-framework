import React from 'react';
import {Table, Column, Cell} from 'fixed-data-table';

const TextCell = ({rowIndex, data, col, props}) => (
    <Cell>
        {data.getObjectAt(rowIndex)[col]}
    </Cell>
);


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

        this._onFilterChange = this._onFilterChange.bind(this);
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
                    rowHeight={50}
                    rowsCount={filteredDataList.getSize()}
                    headerHeight={50}
                    width={this.props.width}
                    height={this.props.height}
                    {...this.props}>
                    <Column
                        header={<Cell>Day</Cell>}
                        cell={<TextCell data={filteredDataList} col="dateOffset" />}
                        fixed={true}
                        width={100}
                    />
                    <Column
                        header={<Cell>Date</Cell>}
                        cell={<TextCell data={filteredDataList} col="prettyDate" />}
                        fixed={true}
                        width={100}
                    />
                    <Column
                        header={<Cell>Code</Cell>}
                        cell={<TextCell data={filteredDataList} col="sourceConceptValue" />}
                        width={100}
                    />
                    <Column
                        header={<Cell>Name</Cell>}
                        cell={<TextCell data={filteredDataList} col="displayName" />}
                        width={200}
                    />
                    <Column
                        header={<Cell>Value</Cell>}
                        cell={<TextCell data={filteredDataList} col="displayValue" />}
                        width={200}
                    />
                </Table>
            </div>
        );
    };
}

export default ChartData;
