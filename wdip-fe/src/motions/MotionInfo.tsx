import * as React from "react";
import { connect } from 'react-redux';
import "./MotionInfo.css";
import { match } from "react-router";
import { MotionsApi, Motion, Proposal, Stakeholder } from "../service/wdip-be";
import { AppState } from '../reducers/';

export interface MotionInfoProps {
    currentMotion: Motion;
    match?: match<any>;
}

class MotionInfo extends React.Component<MotionInfoProps, any> {

    motionsApi: MotionsApi = new MotionsApi();

    private layoutProposal(proposal: Proposal) {
        return <li>{proposal.wording}</li>;
    }

    private layoutStakeholder(stakeholder: Stakeholder) {
        return <li>{stakeholder.name} ({stakeholder.party})</li>;
    }

    public render() {
        {console.log(this.props)}
        const motion  = this.props.currentMotion;
        if (!motion) { return null };
        const statusClass = motion.documentStatus ? motion.documentStatus.toLowerCase() : "";
        return (
            <div className={"motions-info"}>
                <h1>{motion.title}</h1>
                <p>{motion.id}</p>
                <p>Status: <span className={`status-text ${statusClass}`}>{motion.documentStatus}</span></p>
                <h2>Förslag:</h2>
                <ul>
                    {motion.proposals.map(this.layoutProposal)}
                </ul>
                <h2>Intressenter:</h2>
                <ul>
                    {motion.stakeholders.map(this.layoutStakeholder)}
                </ul>
            </div>
        );
    }
}


const mapDispatchToProps = () => ({

})

const mapStateToProps = (state: AppState) => ({
    currentMotion: state.motions.currentMotion
})

export default connect(mapStateToProps, mapDispatchToProps)(MotionInfo); 