import * as React from "react";
import "./MotionInfo.css";
import { match } from "react-router";
import { MotionsApi, Motion, Proposal, Stakeholder } from "../service/wdip-be";

export interface MotionInfoProps {
    motionId: string;
    match: match<any>;
}

export interface MotionInfoState {
    motion: Motion;
}

export class MotionInfo extends React.Component<MotionInfoProps, any> {

    motionsApi: MotionsApi = new MotionsApi();

    constructor(props: MotionInfoProps) {
        super(props);
        this.state = {
            motion: null
        }
    }

    componentWillReceiveProps(nextProps: Readonly<MotionInfoProps>) {
        if (nextProps !== this.props) {
            this.getMotionData(nextProps.match.params.motionId);
        }
    }

    private async getMotionData(id: string) {
        try {
            const result = await this.motionsApi.getMotion(id);
            this.setState({ motion: result });
        } catch (error) {
            console.log(error);
        }
    }

    private layoutProposal(proposal: Proposal) {
        return <li>{proposal.wording}</li>;
    }

    private layoutStakeholder(stakeholder: Stakeholder) {
        return <li>{stakeholder.name} ({stakeholder.party})</li>;
    }

    public render() {
        const { motion } = this.state;
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
