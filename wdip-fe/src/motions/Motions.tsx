import * as React from "react";
import "./Motions.css";
import "rc-slider/assets/index.css";

import { Dispatch } from "redux";
import { GridContainer, Grid, Cell } from 'react-foundation';
import { config } from "../config/config";
import BubbleChart from './BubbleChart';
import MotionsView from './MotionsView';
import { Range } from 'rc-slider';
import { Route, Switch } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { MotionsApi, MotionsByParty, PartyApi, Party } from "src/service/wdip-be";
import * as moment from "moment";
import { AppState } from '../reducers/';
import { connect } from 'react-redux';

export interface MotionsProps {
    getMotionByPartySuccess: (result: MotionsByParty) => any;
    getPartyDataSuccess: (result: Party[]) => any;
    handleDateChange: (values: number[]) => {fromDate: moment.Moment, toDate: moment.Moment};
    motionsByParty: MotionsByParty;
    partyData: Party[];
    match: any;
    fromDate: moment.Moment;
    toDate: moment.Moment;
}

class Motions extends React.Component<MotionsProps, any> {

    motionsApi: MotionsApi = new MotionsApi();
    partyApi: PartyApi = new PartyApi();

    componentDidMount() {
        this.getMotionsByParty();
        this.getPartyData();
    }

    async getMotionsByParty() {
        try {
            const result = await this.motionsApi.getMotionsByParty({
                fromDate: this.props.fromDate.format("YYYY-MM-DD"),
                toDate: this.props.toDate.format("YYYY-MM-DD"),
            });
            this.props.getMotionByPartySuccess(result);
        } catch (error) {
            console.error(error);
        }
    }

    async getPartyData() {
        try {
            this.props.getPartyDataSuccess(await this.partyApi.getAllParties());
        } catch (error) {
            console.error(error);
        }
      }

    private onAfterChangeDate = (values: number[]) => {
        this.getMotionsByParty();
    }

    public render() {
        if (!this.props.motionsByParty || !this.props.partyData) { return null; }

        const { match } = this.props;
        const minYear = config.DEFAULT_FROM_DATE.year();
        const maxYear = config.DEFAULT_TO_DATE.year();
        const fromYear = this.props.fromDate.year();
        const toYear = this.props.toDate.year();

        return (
        <div className="motions">
            <GridContainer>
                <Grid>
                    <Cell>
                        <Range
                            value={[fromYear, toYear]}
                            onChange={this.props.handleDateChange.bind(this)}
                            onAfterChange={this.onAfterChangeDate.bind(this)}
                            min={minYear}
                            max={maxYear}
                        />
                    </Cell>
                    <Cell>
                        <TransitionGroup className="transitiongroup">
                            <CSSTransition timeout={1000} classNames="background">
                                <Switch>
                                    <Route
                                        exact path={match.path} 
                                        render={(props) => {
                                            if (this.props.motionsByParty && this.props.motionsByParty.results && this.props.partyData) {
                                                return (
                                                    <BubbleChart
                                                        {...props}
                                                        results={this.props.motionsByParty.results}
                                                        partyData={this.props.partyData}
                                                    />
                                                )
                                            } else {
                                                return null;
                                            }
                                        }}
                                    />
                                    <Route
                                        path={`${match.path}/:party`}
                                        render={(props) => <MotionsView {...props} fromYear={fromYear+''} toYear={toYear+''} />}
                                    />
                                </Switch>
                            </CSSTransition>
                        </TransitionGroup>
                    </Cell>
                </Grid>
            </GridContainer>
        </div>
        );
    }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    getMotionByPartySuccess: (result: MotionsByParty) => {
        dispatch({type: 'GET_MOTIONS_BY_PARTY_SUCCESS', payload: result})
    },
    getPartyDataSuccess: (result: Party[]) => {
        dispatch({type: 'GET_PARTY_DATA_SUCCESS', payload: result})
    },
    handleDateChange: (values: number[]) => {
        dispatch({type: 'HANDLE_DATE_CHANGE', payload: {fromDate: moment(`${values[0]}-01-01`), toDate: moment(`${values[0]}-01-01`)}})
    }
})

const mapStateToProps = (state: AppState) => ({
    motionsByParty: state.motions.motionsByParty,
    partyData: state.parties.partyData,
    fromDate: state.dates.fromDate,
    toDate: state.dates.toDate
})

export default connect(mapStateToProps, mapDispatchToProps)(Motions);
