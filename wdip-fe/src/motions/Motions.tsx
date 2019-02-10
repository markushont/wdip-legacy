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
import { MotionsByParty, Party } from "src/service/wdip-be";
import * as moment from "moment";
import { AppState } from '../reducers/';
import { connect } from 'react-redux';
import { handleDateChange, handleDirectEnterMotionsView } from "src/actions";

//@ts-ignore
import lifecycle from 'react-pure-lifecycle';

const methods = {
    componentDidMount(props: any) {
        const url = props.history.location.pathname.split('/');
        if(url.length > 2 && props.fromDate && props.toDate) {
            props.handleEnterMotionsView(url[2], props.fromDate, props.toDate)
        }
    }
};

export interface MotionsProps {
    handleDateChange: (values: number[], id?: string) => any;
    motionsByParty: MotionsByParty;
    partyData: Party[];
    match: any;
    fromDate: moment.Moment;
    toDate: moment.Moment;
    currentPartyId: string;
}

const Motions = ({
    handleDateChange,
    motionsByParty,
    partyData,
    match,
    fromDate,
    toDate,
    currentPartyId
}: MotionsProps) => {

    if (!motionsByParty || !partyData) { return null; }
        const minYear = config.DEFAULT_FROM_DATE.year();
        const maxYear = config.DEFAULT_TO_DATE.year();
        const fromYear = fromDate.year();
        const toYear = toDate.year();
        return (
        <div className="motions">
            <GridContainer>
                <Grid>
                    <Cell>
                        <Range
                            value={[fromYear, toYear]}
                            onChange={(values) => {
                                handleDateChange([values[0], values[1]], currentPartyId)
                            }}
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
                                            return (
                                                <BubbleChart
                                                    {...props}
                                                    results={motionsByParty.results ? motionsByParty.results : null}
                                                    partyData={partyData}
                                                />
                                            )
                                            
                                        }}
                                    />
                                    <Route
                                        path={`${match.path}/:party`}
                                        render={(props) => {
                                            return (
                                                <MotionsView {...props} fromYear={fromYear+''} toYear={toYear+''} />
                                            )
                                        }}
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
    handleDateChange: (values: number[], id?: string) => {
        dispatch(handleDateChange(values, id))
    },
    handleEnterMotionsView: (id: string, fromDate: any, toDate: any) => {
        handleDirectEnterMotionsView(id, fromDate, toDate).then(result => {
            return dispatch(result)
        })
    }
})

const mapStateToProps = (state: AppState, ownProps: any) => ({
    motionsByParty: state.motions.motionsByParty,
    partyData: state.parties.partyData,
    fromDate: state.dates.fromDate,
    toDate: state.dates.toDate,
    currentPartyId: state.parties.currentPartyId,
    match: ownProps.match
})

export default connect(mapStateToProps, mapDispatchToProps)(lifecycle(methods)(Motions));
