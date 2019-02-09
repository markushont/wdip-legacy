import * as React from 'react';
import { Normalizer } from 'src/service/Normalizer';
import { Bubble } from 'react-chartjs-2';
import 'chartjs-plugin-annotation';
import * as moment from 'moment';
import { GET_MOTIONS_FOR_PARTY } from 'src/actions';
import { Dispatch } from 'redux';
import { AppState } from '../reducers/';
import { config } from 'src/config/config';
import { MotionsByPartyResults, Party } from 'src/service/wdip-be';
import { connect } from 'react-redux';

interface BubbleChartProps {
    getMotionsForParty: (id: string, fromDate: moment.Moment, toDate: moment.Moment) => any;
    results: Array<MotionsByPartyResults>;
    history: any;
    partyData: Party[];
}

class BubbleChart extends React.Component<BubbleChartProps, any> {
    private normalizer: Normalizer;

    constructor(props: any) {
        super(props);
    }

    public onClickBubble(e: any, activeElements: any): void {
        if (this.props.history &&
            activeElements.length &&
            this.props.results &&
            activeElements[0]._datasetIndex < this.props.results.length)
        {
            const id = this.props.results[activeElements[0]._datasetIndex].party;
            if (id) {
                this.props.getMotionsForParty(id, config.DEFAULT_FROM_DATE, config.DEFAULT_TO_DATE)
                this.props.history.push(`/motions/${id}`);
            }
        }
    }

    public render() {
        let bubbles = {
            datasets: Array<any>()
        }
        let options = {
            legend:{
                display:false
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItem: any, data: any) {
                        var approved = data.datasets[tooltipItem.datasetIndex].data[0].approved;
                        var declined = data.datasets[tooltipItem.datasetIndex].data[0].declined;

                        return ["Bifall: " + approved, "Avslag: " + declined];
                    },
                    title: function (tooltipItem: any, data: any) {
                        return data.datasets[tooltipItem[0].datasetIndex].data[0].fullName;
                    }
                }
            },
            scales: {
                yAxes: [{
                    id: 'y-axis-0',
                    ticks: {
                        min: 0,
                        max: 10,
                        stepSize: 1
                    }
                }],
                xAxes: [{
                    id: 'x-axis-0',
                    ticks: {
                        min: 0,
                        max: 10,
                        stepSize: 1
                    }
                }]
            },
            annotation: {
                annotations: [
                    {
                        drawTime: 'afterDatasetsDraw',
                        type: 'line',
                        mode: 'horizontal',
                        scaleID: 'y-axis-0',
                        value: 5,
                        borderColor: 'gray',
                        borderWidth: 1,
                        label: {
                            enabled: false,
                        }
                    },
                    {
                        drawTime: 'afterDatasetsDraw',
                        borderColor: 'gray',
                        borderWidth: 1,
                        mode: 'vertical',
                        type: 'line',
                        value: 5,
                        scaleID: 'x-axis-0',
                    }
                ]
            },
            maintainAspectRatio: false,
            animation: {
                duration: 2000
            },
            onClick: this.onClickBubble.bind(this)
        }

        if (this.props.results) {

            const minSubmitted: any = this.props.results.reduce(function (prev: any, current: any) {
                return (prev.submitted < current.submitted) ? prev : current
            }).submitted;

            const maxSubmitted: any = this.props.results.reduce(function (prev: any, current: any) {
                return (prev.submitted > current.submitted) ? prev : current
            }).submitted;

            this.normalizer = new Normalizer(minSubmitted, maxSubmitted);

            bubbles.datasets = this.props.results.map((result: any) => ({
                label: result.party,
                data: [{
                    r: (this.normalizer.normalize(result.submitted) < 10 ? 10 : this.normalizer.normalize(result.submitted)) || "0",
                    approved: result.approved || "0",
                    declined: result.declined || "0" 
                }],
                pointStyle: 'circle',
                borderWidth: 3,
                hoverRadius: 20
            }));
            
            if (this.props.partyData){
                const partyData = {};
                for (const data of this.props.partyData) {
                    partyData[data.id] = data;
                }
                for (let bubble of bubbles.datasets) {
                    bubble.data[0].x = partyData[bubble.label].x;
                    bubble.data[0].y = partyData[bubble.label].y;
                    bubble.backgroundColor = partyData[bubble.label].color;
                    bubble.data[0].fullName = partyData[bubble.label].name;
                }
            }
        }

        const divStyle = {
            position: "fixed",
            zIndex: -1000
         } as React.CSSProperties;

        return (
            <div style = {divStyle}>
                <Bubble
                    type='bubble'
                    data={bubbles}
                    options={options}
                    width={800}
                    height={800} />
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    getMotionsForParty: (id: string, fromDate: moment.Moment, toDate: moment.Moment) => {
        dispatch({type: GET_MOTIONS_FOR_PARTY, payload: { id, fromDate, toDate }})
    }
})

const mapStateToProps = (state: AppState, ownProps: any) => ({
    results: ownProps.results,
    history: ownProps.history,
    partyData: ownProps.partyData
})
  
export default connect(mapStateToProps, mapDispatchToProps)(BubbleChart);
