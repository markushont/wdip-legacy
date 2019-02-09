import * as React from "react";
import { connect } from 'react-redux';
import "./MotionInfo.css";
import { match } from "react-router";
import { Motion, Proposal, Stakeholder } from "../service/wdip-be";
import { AppState } from '../reducers/';

export interface MotionInfoProps {
    currentMotion: Motion;
}

const layoutProposal = (proposal: Proposal, index: number) => {
    return <li key={index}>{proposal.wording}</li>;
}

const layoutStakeholder = (stakeholder: Stakeholder, index: number) => {
    return <li key={index}>{stakeholder.name} ({stakeholder.party})</li>;
}

const MotionInfo = ({
    currentMotion
}: MotionInfoProps) => {
    const statusClass = (currentMotion && currentMotion.documentStatus) ? currentMotion.documentStatus.toLowerCase() : "";

    if (currentMotion) {
        return (
            <div className={"motions-info"}>
                <h1>{currentMotion.title}</h1>
                <p>{currentMotion.id}</p>
                <p>Status: <span className={`status-text ${statusClass}`}>{currentMotion.documentStatus}</span></p>
                <h2>Förslag:</h2>
                <ul>
                    {currentMotion.proposals.map((proposal, index) => {return layoutProposal(proposal, index)})}
                </ul>
                <h2>Intressenter:</h2>
                <ul>
                    {currentMotion.stakeholders.map((stakeholder, index) => {return layoutStakeholder(stakeholder, index)})}
                </ul>
            </div>
        )
    } else {
        return null;
    }
}

const mapDispatchToProps = () => ({})

const mapStateToProps = (state: AppState) => ({
    currentMotion: state.motions.currentMotion
})

export default connect(mapStateToProps, mapDispatchToProps)(MotionInfo);
