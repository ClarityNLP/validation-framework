import React from 'react';
import {Table, Column, Cell} from 'fixed-data-table-2';

const TextCell = ({rowIndex, data, col, props}) => {
    const dataContent = data.getObjectAt(rowIndex);
    return (<Cell style={{width:"100%"}} >
        <div>{dataContent[col]}</div>
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
                        cell={<TextCell data={finalDataList} col="sourceValue"  />}
                        width={100}
                    />
                    <Column
                        header={<Cell>Age</Cell>}
                        cell={<TextCell data={finalDataList} col="age" />}
                        width={75}
                    />
                    <Column
                        header={<Cell>Gender</Cell>}
                        cell={<TextCell data={finalDataList} col="gender"  />}
                        width={75}
                    />
                    <Column
                        header={<Cell>Completed</Cell>}
                        cell={<TextCell data={finalDataList} col="completed"  />}
                        width={200}
                    />
                    <Column
                        header={<Cell>Status</Cell>}
                        cell={<TextCell data={finalDataList} col="status" />}
                        width={150}
                    />
                    <Column
                        header={<Cell>Comments</Cell>}
                        cell={<TextCell data={finalDataList} col="comments" />}
                        width={200}
                    />
                </Table>
            </div>
        );
    };
}

export default ChartData;
