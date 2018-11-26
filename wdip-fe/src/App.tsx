import * as React from 'react';
import './App.css';

import { GridContainer, Grid, Cell } from 'react-foundation';
import DatePicker from 'react-date-picker';
import Header from './Header';
import { MotionsApi, ChartsApi, PartyApi } from './service/wdip-be';
import BubbleChart from './modules/BubbleChart';
import MotionsView from './modules/MotionsView';


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
      partyData: {}
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

  public onChangeFromDate = (value: Date) => {
    this.setState({ fromDate: value }, this.fetchData);
  }

  public onChangeToDate = (value: Date) => {
    this.setState({ toDate: value }, this.fetchData);
  }

  public render() {

    const { fromDate, toDate } = this.state;
    return (
      <div>
        <Header />
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

            <Cell medium={5}>
              Från
              <DatePicker
                onChange={this.onChangeFromDate}
                value={fromDate}
              />
            </Cell>
            <Cell medium={5}>
              Till
              <DatePicker
                onChange={this.onChangeToDate}
                value={toDate}
              />
            </Cell>
            <Cell medium={8}><BubbleChart
              results={this.state.motionsByParty.results}
              partyData={this.state.PartyData}>
            </BubbleChart>
            </Cell>
            <Cell medium={4}/>

            <Cell medium={8}>
            <MotionsView></MotionsView>
            </Cell>
          </Grid>
        </GridContainer>
        



      </div >
    );
  }
}
export default App;
