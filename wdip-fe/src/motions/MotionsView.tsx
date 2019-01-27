import * as React from 'react';
import { Bubble } from 'react-chartjs-2';
import { Route } from "react-router-dom";
import * as chartjs from "chart.js";
import { MotionsApi, Motions, Motion } from "../service/wdip-be";
import { MotionInfo } from "./MotionInfo";
import "./MotionsView.css";

const colorApproved = "#41B3A3";
const colorPending  = "#FADA5E";
const colorRejected = "#E27D60";

interface MotionsViewState {
    motions: Motions;
    selectedMotionId: string;
}

class MotionsView extends React.Component<any, MotionsViewState> {

    motionsApi: MotionsApi = new MotionsApi();

    constructor(props: any) {
        super(props);
        this.state = {
            motions: {
                total: 0,
                startResult: 0,
                endResult: 0,
                results: []
            },
            selectedMotionId: ""
        }
    }

    public onClickBubble(e: any, activeElements: any): void {
        const { history, match } = this.props;
        const results = this.state.motions.results;
        if (history && activeElements.length && results && results.length) {
            const id = results[activeElements[0]._datasetIndex].id;
            if (id) {
                history.push(`/motions/${match.params.party}/${id}`);
            }
        }
    }

    private async getPartyData() {
        if (this.props.fromYear && this.props.toYear) {
            const { match } = this.props;
            try {
                const id = match && match.params ? match.params.party : "";
                const fromDate = `${this.props.fromYear}-01-01`;
                const toDate = `${this.props.toYear}-12-31`;
                const result = await this.motionsApi.getMotionsForParty(id, fromDate, toDate);
                this.setState({ motions: result });
            } catch (error) {
                console.error(error);
            }
        }
    }

    componentWillMount() {
        this.getPartyData();
    }

    componentWillReceiveProps() {
        this.getPartyData();
    }

    private layout(motion: Motion, index: number, array: Motion[]): chartjs.ChartDataSets {
        const length = array.length;
        const columns = Math.floor(Math.sqrt(length));
        const rows = Math.floor(length / columns);
        const r = length > 50 ? 15 : 30;

        const x = index % columns;
        const y = rows - Math.floor(index / columns);
        let backgroundColor = colorRejected;
        switch (motion.documentStatus) {
            case "PENDING":
                backgroundColor = colorPending;
                break;
            case "APPROVED":
                backgroundColor = colorApproved;
                break;
            case "REJECTED":
                backgroundColor = colorRejected;
                break;
        }

        return {
            backgroundColor,
            data: [{ x, y, r }],
            label: motion.id
        }
    }

    public render() {
        const layoutedMotions: chartjs.ChartDataSets[] = this.state.motions.results
            ? this.state.motions.results.map<chartjs.ChartDataSets>(this.layout)
            : [];
        const divStyle = {
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
            },
            onClick: this.onClickBubble.bind(this)
        }

        const { match } = this.props;

        return (
            <div className={"motions-view"} style={divStyle}>
                <Bubble
                    type='bubble'
                    data={{ datasets: layoutedMotions }}
                    options={options}
                    width={800}
                    height={800} />
                <Route
                    path={`${match.path}/:motionId`}
                    render={(props) => <MotionInfo {...props} motionId={this.state.selectedMotionId} />}/>
            </div>
        );
    }
}

export default MotionsView;