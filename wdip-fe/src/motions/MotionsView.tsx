import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from "redux";
import { Bubble } from 'react-chartjs-2';
import { Route } from "react-router-dom";
import * as chartjs from "chart.js";
import { Motions, Motion } from "../service/wdip-be";
import MotionInfo from "./MotionInfo";
import { AppState } from '../reducers/';
import "./MotionsView.css";
import { GET_MOTION_DATA } from 'src/actions';

const colorApproved = "#41B3A3";
const colorPending  = "#FADA5E";
const colorRejected = "#E27D60";

interface MotionsViewProps {
    motions: Motions;
    getMotionData: (id: string) => any;
    history: any;
    match: any;
    fromYear: string;
    toYear: string;
}

const MotionsView = ({
    motions,
    getMotionData,
    match,
    history,
}: MotionsViewProps) => {
    // componentWillMount() {
    //     this.getPartyData();
    // }

    function layout(motion: Motion, index: number, array?: Motion[]): chartjs.ChartDataSets {
        const length = array ? array.length : 0;
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

    function onClickBubble(e: any, activeElements: any): void {
        const results = motions.results;
        if (history && activeElements.length && results && results.length) {
            const id = results[activeElements[0]._datasetIndex].id;
            if (id) {
                getMotionData(id);
                history.push(`/motions/${match.params.party}/${id}`);
            }
        }
    }

    const layoutedMotions: chartjs.ChartDataSets[] = (motions && motions.results)
        ? motions.results.map<chartjs.ChartDataSets>((motion, index) => layout(motion, index, motions.results))
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
        onClick: (e: any, item: any) => {
            onClickBubble(e, item);
        }
    }

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
                render={() => <MotionInfo />}/>
        </div>    
    );
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    getMotionData: (id: string) => {
        dispatch({type: GET_MOTION_DATA, payload: id})
    }
})

const mapStateToProps = (state: AppState, ownProps: any) => ({
    motions: state.motions.motionsForParty,
    match: ownProps.match,
    history: ownProps.history
})
  
export default connect(mapStateToProps, mapDispatchToProps)(MotionsView);