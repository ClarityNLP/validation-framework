import React from 'react';
import {Table, Column, Cell} from 'fixed-data-table-2';

const TextCell = ({rowIndex, data, col, props}) => {
    var dataContent = data.getObjectAt(rowIndex);
    let contents;
    let className = 'col-' + col;
    if (col === 'displayName') {
        if (dataContent.type === 'document') {
            contents = <div style={{width:"100%"}}><pre style={{border:"none", background:"none", fontFamily: "Roboto,'Helvetica Neue',Helvetica,Arial,sans-serif"}}>{dataContent[col]}</pre></div>
        } else {
            contents = <div className="row" style={{width:"100%"}}>
                <div className="col-xs-2">{dataContent.sourceConceptValue}</div>
                <div className="col-xs-8">{dataContent.displayName}</div>
                <div className="col-xs-2">{dataContent.displayValue}</div>
            </div>
        }
    } else {
        contents = <div>{dataContent[col]}</div>
    }

    return (<Cell style={{width:"100%"}} className={className} >
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
                return (Math.round(obj.displayName.replace(/\n/g, this.fillerText).length / 85) * 22) + 22
            } else {
                return Math.max(Math.round(obj.displayName.length / 45) * 28, 36);
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
                <Table
                    rowHeightGetter={this._rowHeightGetter}
                    rowHeight={40}
                    rowsCount={filteredDataList.getSize()}
                    headerHeight={40}
                    style={{marginTop:"5px"}}
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
                        header={<Cell>Data</Cell>}
                        cell={<TextCell data={filteredDataList} col="displayName" style={{fontWeight:"bold"}} />}
                        width={600}
                    />
                </Table>
            </div>
        );
    };
}

export default ChartData;
