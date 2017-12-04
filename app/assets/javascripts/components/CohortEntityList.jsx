import React from 'react';

import CohortChartData from './CohortChartData.jsx';
import DataStore from './DataStore.jsx';

class CohortEntityList extends React.Component {

  constructor(props) {
    super(props);
    let entitySize = props.entities ? props.entities.length : 0;
    this.state = {
        chartHeight : 500,
        chartWidth: 400,
        entities: new DataStore(props.entities),
        entitySize : entitySize
    };
    this.updateDimensions = this.updateDimensions.bind(this);
  }

    updateDimensions() {
        const height = (window.innerHeight - 250);
        const width = (window.innerWidth - 50);
        this.setState(prevState => ({ chartWidth : width, chartHeight : height }));
    };

    componentWillMount() {
        this.updateDimensions();
    };

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
        this.updateDimensions();
    }

    componentDidMount() {
        window.addEventListener("resize", this.updateDimensions);
    }

    componentWillReceiveProps(nextProps) {
        let entitySize = nextProps.entities ? nextProps.entities.length : 0;
        if (entitySize !== this.state.entitySize) {
            this.setState({
                entities : new DataStore(nextProps.entities),
                entitySize : entitySize
            });
        }
    }

    render() {
        return (
            <div>
                <CohortChartData
                    subjectSelected={this.props.subjectSelected}
                    entities={this.state.entities}
                    width={this.state.chartWidth}
                    height={this.state.chartHeight}
                    results={this.props.results}/>
            </div>
        );
      };
}

export default CohortEntityList;
