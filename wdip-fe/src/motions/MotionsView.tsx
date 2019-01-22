import * as React from 'react';
import { Bubble } from 'react-chartjs-2';
const colorApproved = "#41B3A3";
const colorDeclined = "#E27D60";


class MotionsView extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    public setPosition(motionSet: Array<any>) {
        var length = motionSet.length;

        var rows = Math.floor(Math.sqrt(length));
        while (length % rows != 0) {
            rows = rows - 1;
        }

        let columns = length / rows;
        let r = length > 50 ? 15 : 30;
        let x = 0;
        let y = 0;
        motionSet.forEach(function (element) {
            element.backgroundColor = element.data[0].status == "approved" ? colorApproved : colorDeclined;
            element.data[0].x = x;
            element.data[0].y = y;
            element.data[0].r = r;

            if (x < columns - 1) {
                x++;
            } else {
                y--;
                x = 0;
            }
        });
        return motionSet;
    }

    public createData(numberOfMotions: number) {

        const approved = numberOfMotions * 0.55;

        var datasets = [];

        var i = 0;
        for (i; i < approved; i++) {
            {
                datasets.push({
                    data: [{
                        summary: "this is a summary",
                        status: "approved"
                    }]
                })
            }
        }

        for (i; i < numberOfMotions; i++) {
            {
                datasets.push({
                    data: [{
                        summary: "this is a summary",
                        status: "declined"
                    }]
                })
            }
        }

        return datasets;

    }

    public render() {

        let motions = { datasets: this.setPosition(this.createData(50)) };
        const divStyle = {
            position: "fixed",
            zIndex: -1000,
        } as React.CSSProperties;

        var options = {
            legend: {
                display: false
            },
            display: false,
            scales: {
                yAxes: [{
                    id: 'y-axis-0',
                    display: false
                }],
                xAxes: [{
                    id: 'x-axis-0',
                    display: false
                }]
            },
            layout: {
                padding: {
                    left: 50,
                    right: 50,
                    top: 50,
                    bottom: 50
                }
            }
        }
        return (
            <div style={divStyle}>
                <Bubble
                    type='bubble'
                    data={motions}
                    options={options}
                    width={800}
                    height={800} />
            </div>
        );
    }
}

export default MotionsView;