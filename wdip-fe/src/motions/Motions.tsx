import * as React from "react";
import "./Motions.css";
import "rc-slider/assets/index.css";

import { Dispatch } from "redux";
import { GridContainer, Grid, Cell } from 'react-foundation';
import { config } from "../config/config";
import BubbleChart from './BubbleChart';
import MotionsView from './MotionsView';
import { Range } from 'rc-slider';
import { Route, Switch, match } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { MotionsApi, MotionsByParty, PartyApi } from "src/service/wdip-be";
import * as moment from "moment";
import { AppState } from '../reducers/';
import { connect } from 'react-redux';

interface MotionsState {
    fromDate: moment.Moment;
    toDate: moment.Moment;
    partyData?: any;
};

export interface MotionsProps {
    getMotionByPartySuccess: (result: MotionsByParty) => any;
    motionsByParty: MotionsByParty;
    match: any;
}

class Motions extends React.Component<MotionsProps, MotionsState> {

    motionsApi: MotionsApi = new MotionsApi();
    partyApi: PartyApi = new PartyApi();

    constructor(props: any) {
        super(props);
        this.state = {
            fromDate: config.DEFAULT_FROM_DATE,
            toDate: config.DEFAULT_TO_DATE,
       };
    }

    componentDidMount() {
        this.getMotionsByParty();
        this.getPartyData();
    }

    async getMotionsByParty() {
        try {
            const result = await this.motionsApi.getMotionsByParty({
                fromDate: this.state.fromDate.format("YYYY-MM-DD"),
                toDate: this.state.toDate.format("YYYY-MM-DD"),
            });
            this.props.getMotionByPartySuccess(result); // redux
            // this.setState({ motionsByParty: motions });
        } catch (error) {
            console.error(error);
        }
    }

    async getPartyData() {
        try {
          this.setState({ partyData: await this.partyApi.getAllParties() });
        } catch (error) {
          console.error(error);
        }
      }

    public onChangeDate = (values: number[]) => {
        this.setState({
            fromDate: moment(`${values[0]}-01-01`),
            toDate: moment(`${values[1]}-01-01`)
        });
    }

    public onAfterChangeDate = (values: number[]) => {
        this.getMotionsByParty();
    }

    public render() {
        if (!this.props.motionsByParty || !this.state.partyData) { return null; }

        const { match } = this.props;
        const minYear = config.DEFAULT_FROM_DATE.year();
        const maxYear = config.DEFAULT_TO_DATE.year();
        const fromYear = this.state.fromDate.year();
        const toYear = this.state.toDate.year();

        return (
        <div className="motions">
            <GridContainer>
                <Grid>
                    <Cell>
                        <Range
                            value={[fromYear, toYear]}
                            onChange={this.onChangeDate.bind(this)}
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
                                        render={(props) =>
                                            <BubbleChart
                                                {...props}
                                                results={this.props.motionsByParty.results}
                                                partyData={this.state.partyData}
                                            />
                                        }
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
    }
})

const mapStateToProps = (state: AppState) => ({
    motionsByParty: state.motions.motionsByParty
})

export default connect(mapStateToProps, mapDispatchToProps)(Motions);