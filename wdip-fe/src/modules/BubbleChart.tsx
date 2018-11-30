import * as React from 'react';
import { Normalizer } from 'src/service/Normalizer';
import { Bubble } from 'react-chartjs-2';
import 'chartjs-plugin-annotation';

class BubbleChart extends React.Component<any, any> {
    private normalizer: Normalizer;

    constructor(props: any) {
        super(props);
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
            onClick: (event: any, activeElements: any) =>
            {
                this.props.changePage();
            }
        }

        if (this.props.results) {

            const minSubmitted = this.props.results.reduce(function (prev: any, current: any) {
                return (prev.submitted < current.submitted) ? prev : current
            }).submitted;

            const maxSubmitted = this.props.results.reduce(function (prev: any, current: any) {
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

            
            const partyData = this.props.partyData;
            if(partyData){
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
                    height={800} 
                   />
            </div>
        );
    }
}

export default BubbleChart;
