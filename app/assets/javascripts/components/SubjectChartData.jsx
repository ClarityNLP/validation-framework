import React from 'react';
import {Table, Column, Cell} from 'fixed-data-table-2';

const TextCell = ({rowIndex, data, col, props}) => {
    const dataContent = data.getObjectAt(rowIndex);
    let contents;
    let className = 'col-' + col;
    let domainClass = 'text-' + dataContent.domain;
    
    
    if (col === 'displayName') {
        if (dataContent.type === 'document') {
            contents = <div style={{width:"100%"}}><pre style={{border:"none", background:"#fff", color:"#141823"}}>{dataContent[col]}</pre></div>
        } else {
            contents = <div className="row" style={{width:"100%"}}>
                <div className="col-xs-2">{dataContent.sourceConceptValue}</div>
                <div className="col-xs-8"><b className={domainClass}>{dataContent.displayName}</b></div>
                <div className="col-xs-2">{dataContent.displayValue}</div>
            </div>
        }
    } else if (col === 'dateOffset') {
        contents = <div><b>{dataContent[col]}</b></div>
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
        return this._indexMap ? this._indexMap.length : 0;
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
        this.doFilter = this.doFilter.bind(this);
        this._onFilterChange = this._onFilterChange.bind(this);
        this._rowHeightGetter = this._rowHeightGetter.bind(this);
        this._rowClassNameGetter = this._rowClassNameGetter.bind(this);

        this._dataList = props.chartdata;
        let filteredList = this.doFilter(this._dataList, props.filters, '');
        this.counts = filteredList.domainCounts;
        this.totalCount = filteredList.totalCount;

        this.state = {
            filteredDataList : new DataListWrapper(filteredList.filteredIndexes, this._dataList),
            filterBy : '',
            goToDay : props.goToDay,
            currentIndex : 0,
            indexDate : filteredList.indexDate,
            indexRow : filteredList.indexRow
        };
        this.fillerText = '                                                                      ';
    }

    _onFilterChange(e) {
        if (!e.target.value) {
            this.setState({
                filteredDataList: this._dataList,
            });
        }

        const filterBy = e.target.value.toLowerCase();
        const filtered = this.doFilter(this._dataList, this.props.filters, filterBy);
        this.props.setDomainCounts(filtered.domainCounts);
        this.props.setTotalCount(filtered.totalCount);
        this.counts = filtered.domainCounts;
        this.totalCount = filtered.totalCount;

        this.setState({
            filterBy : filterBy,
            filteredDataList: new DataListWrapper(filtered.filteredIndexes, this._dataList),
            indexRow : filtered.indexRow,
            indexDate : filtered.indexDate
        });
    }

    doFilter(dataList, domainFilters, filterText) {
        let indexDate = null, indexRow = 0;
        const size = dataList.getSize();
        let filteredIndexes = [];
        let filteredIndex = -1;
        let domainCounts = {};
        let totalCount = 0;
        for (let index = 0; index < size; index++) {
            const {displayName, domain, dateOffset} = dataList.getObjectAt(index);
            if (domainFilters[domain].checked) {
                if (displayName.toLowerCase().indexOf(filterText) !== -1) {
                    filteredIndexes.push(index);
                    filteredIndex++;

                    if (!domainCounts[domain]) {
                        domainCounts[domain] = 0;
                    }
                    domainCounts[domain]++;
                    totalCount++;
                }
            }

            if (indexDate !== 0) {
                if (indexDate === null) {
                    indexDate = dateOffset;
                    indexRow = filteredIndex;
                }
                if (dateOffset === 0) {
                    indexDate = 0;
                    indexRow = filteredIndex;
                } else {
                    if (dateOffset > indexDate && dateOffset < 0) {
                        indexDate = dateOffset;
                        indexRow = filteredIndex;
                    } else {
                        if (dateOffset > 0 && dateOffset < indexDate) {
                            indexDate = dateOffset;
                            indexRow = filteredIndex;
                        }
                    }
                }
            }
        }

        if (indexRow < 0) {
            indexRow = 0;
        }
        return {
            filteredIndexes : filteredIndexes,
            indexRow : indexRow,
            indexDate : indexDate,
            domainCounts : domainCounts,
            totalCount : totalCount
        };
    }

    _rowHeightGetter(index) {
        var obj = this.state.filteredDataList.getObjectAt(index);
        if (obj) {
            if (obj.type === 'document') {
                return (Math.round(obj.displayName.replace(/\n/g, this.fillerText).length / 70) * 22) + 28
            } else {
                return Math.max(Math.round(obj.displayName.length / 50) * 36, 40);
            }
        } else {
            return 0;
        }
    }

    _rowClassNameGetter(rowIndex) {
        if (rowIndex === this.state.filteredDataList._indexMap[this.state.currentIndex]) {
            return 'active_row';
        }
    }

    componentDidMount() {
        this.props.setDomainCounts(this.counts);
        this.props.setTotalCount(this.totalCount);
    }

    componentWillReceiveProps(nextProps) {
        const filtered = this.doFilter(this._dataList, nextProps.filters, this.state.filterBy);
        const filteredWrapper = new DataListWrapper(filtered.filteredIndexes, this._dataList);
        if (filtered.totalCount !== this.totalCount) {
            this.totalCount = filtered.totalCount;
            this.counts = filtered.domainCounts;
            this.props.setDomainCounts(this.counts);
            this.props.setTotalCount(this.totalCount);
        }

        this.setState({
            filteredDataList: filteredWrapper,
            indexRow : filtered.indexRow,
            indexDate : filtered.indexDate
        });


        if (this.state.goToDay !== nextProps.goToDay) {
            // do something - go to index day.
            let goToIndex;
            switch (nextProps.goToDay) {
                case 'bottom' :
                    goToIndex = Math.max(this.state.filteredDataList.getSize() - 1, 0);
                    break;
                case 'index' :
                    goToIndex = this.state.indexRow;
                    break;
                default:
                    goToIndex = 0;
            }
            console.log('go to ' + goToIndex);
            this.setState({
               goToDay : nextProps.goToDay,
               currentIndex : goToIndex
            });
        }
    }


    render() {
        var {filteredDataList, currentIndex} = this.state;
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
                    scrollToRow={filteredDataList._indexMap[currentIndex]}
                    rowClassNameGetter={this._rowClassNameGetter}
                    {...this.props}>
                    <Column
                        header={<Cell>Day</Cell>}
                        cell={<TextCell data={filteredDataList} col="dateOffset" />}
                        fixed={true}
                        width={55}
                    />
                    <Column
                        header={<Cell>Date</Cell>}
                        cell={<TextCell data={filteredDataList} col="prettyDate" />}
                        fixed={true}
                        width={70}
                    />
                    <Column
                        header={<Cell>Data</Cell>}
                        cell={<TextCell data={filteredDataList} col="displayName" style={{fontWeight:"bold"}} />}
                        width={600}
                        flexGrow={1}
                    />
                </Table>
            </div>
        );
    };
}

export default ChartData;
