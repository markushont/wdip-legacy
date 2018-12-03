import * as React from 'react';
import './App.css';
import 'rc-slider/assets/index.css';

import { GridContainer, Grid, Cell } from 'react-foundation';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { MotionsApi, ChartsApi, PartyApi } from './service/wdip-be';
import BubbleChart from './modules/BubbleChart';
import MotionsView from './modules/MotionsView';
import {Range} from 'rc-slider';


const DEFAULT_FROM_DATE = new Date(2000, 1, 1);
const DEFAULT_TO_DATE = new Date();


class App extends React.Component<any, any> {

  motionsApi: MotionsApi = new MotionsApi();
  chartsApi: ChartsApi = new ChartsApi();
  partyApi: PartyApi = new PartyApi();

  constructor(props: any) {
    super(props);
    this.state = {
      fromDate: DEFAULT_FROM_DATE,
      toDate: DEFAULT_TO_DATE,
      motionsByParty: {},
      wordCloudData: [],
      partyData: {},
      home: true
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    this.getMotionsByParty();
    this.getWordCloudData();
    this.getPartyData();
  }

  async getMotionsByParty() {
    try {
      this.setState({ motionsByParty: await this.motionsApi.getMotionsByParty(this.state.fromDate, this.state.toDate) });
    } catch (error) {
      console.error(error);
    }
  }

  async getPartyData() {
    try {
      this.setState({ PartyData: await this.partyApi.getAllParties() });
    } catch (error) {
      console.error(error);
    }
  }

  async getWordCloudData() {
    try {
      this.setState({ wordCloudData: await this.chartsApi.getWordCloud(this.state.fromDate, this.state.toDate) });
    } catch (error) {
      console.error(error);
    }
  }

  public onChangePage() {
    this.setState({ home: !this.state.home });
  }

  public onChangeDate = (values: number[]) => {
    this.setState({ fromDate: new Date(values[0], 1, 1), toDate: new Date(values[1], 1, 1) }, this.fetchData);
  }

  renderPage() {
    switch (this.state.home) {
      case true:
        return (<BubbleChart
          key={'BubbleChart'}
          results={this.state.motionsByParty.results}
          partyData={this.state.PartyData}
          changePage={this.onChangePage.bind(this)}
        >
        </BubbleChart>);
      case false:
        return (<MotionsView
          key={'MotionsView'}
          changePage={this.onChangePage.bind(this)}>
        </MotionsView>);
      default:
        console.log("default");
        return (<BubbleChart
          key={'BubbleChart'}
          results={this.state.motionsByParty.results}
          partyData={this.state.PartyData}
          changePage={this.onChangePage.bind(this)}
        >
        </BubbleChart>);
    }
  }


  public render() {
    const wrapperStyle = { width: 800 };



    return (
      <div className="test">
        <GridContainer>
          <Grid >
            <Cell>
              <h1>WDIP</h1>
            </Cell>
            <Cell>
              <h2>
                Motioner per parti
              </h2>
            </Cell>
            <div style={wrapperStyle}>
              <Range value={[this.state.fromDate.getFullYear(), this.state.toDate.getFullYear()]} onChange={this.onChangeDate}
                min={2001} max={2018}/>
            </div>
            <Cell>
            </Cell>
            <Cell>
              <TransitionGroup
                className="transitiongroup">
                <CSSTransition
                  key={this.state.home}
                  timeout={1000}
                  classNames="background">
                  {this.renderPage()}
                </CSSTransition>
              </TransitionGroup>
            </Cell>

          </Grid>
        </GridContainer>
      </div >
    );
  }
}
export default App;
