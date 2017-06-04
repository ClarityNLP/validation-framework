import React from 'react';
import CohortChartData from './CohortChartData.jsx';

class CohortEntityList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        chartHeight : 500,
        chartWidth: 400
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

    render() {
        return (
            <div>
                <CohortChartData
                    subjectSelected={this.props.subjectSelected}
                    entities={this.props.entities}
                    width={this.state.chartWidth}
                    height={this.state.chartHeight}
                    results={this.props.results}/>
            </div>
        );
      };
}

export default CohortEntityList;
