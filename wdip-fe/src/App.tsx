import * as React from 'react';
import './App.css';

import { GridContainer, Grid, Cell } from 'react-foundation';
import Header from './Header';
import { MotionsApi, ChartsApi } from './service/wdip-be';
import WordCloud from './modules/WordCloud';
import Chart from './modules/BarChart';
const DEFAULT_FROM_DATE = new Date(2000, 1, 1);
const DEFAULT_TO_DATE = new Date();

class App extends React.Component<any, any> {

  motionsApi: MotionsApi = new MotionsApi();
  chartsApi: ChartsApi = new ChartsApi();

  constructor(props: any) {
    super(props);
    this.state = {
      fromDateStr: DEFAULT_FROM_DATE.toISOString().split('T')[0],
      toDateStr: DEFAULT_TO_DATE.toISOString().split('T')[0],
      motionsByParty: {},
      wordCloudData: []
    };

    this.setDate = this.setDate.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    this.getMotionsByParty();
    this.getWordCloudData();
  }

  async getMotionsByParty() {
    try {
      this.setState({ motionsByParty: await this.motionsApi.getMotionsByParty(this.state.fromDateStr, this.state.toDateStr) });
    } catch (error) {
      console.error(error);
    }
  }

  async getWordCloudData() {
    try {
      this.setState({ wordCloudData: await this.chartsApi.getWordCloud(this.state.fromDateStr, this.state.toDateStr) });
    } catch (error) {
      console.error(error);
    }
  }

  setDate(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ [e.target.name]: e.target.value }, this.fetchData);
  }

  public render() {
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
              <label> Från <input name="fromDate" onChange={(e) => this.setDate(e)} value={this.state.fromDateStr} type="date"></input>
              </label>
            </Cell>
            <Cell medium={5}>
              <label> Till <input name="fromDate" onChange={(e) => this.setDate(e)} value={this.state.toDateStr} type="date"></input>
              </label>
            </Cell>
            <Cell>

              <Chart
                fromDate={this.state.fromDateStr}
                toDate={this.state.toDateStr}
                results={this.state.motionsByParty.results} />
            </Cell>

            <Cell medium={4}>              
            </Cell>
            <Cell medium={8}><WordCloud data={this.state.wordCloudData}></WordCloud></Cell>

          </Grid>
        </GridContainer>


      </div >
    );
  }
}
export default App;
