import * as React from 'react';
import './App.css';

import { GridContainer, Grid, Cell } from 'react-foundation';
import Header from './Header';
import { MotionsApi } from './service/wdip-be';
import WordCloud from './modules/WordCloud';
import Chart from './modules/BarChart';
const DEFAULT_FROM_DATE = new Date(2000, 1, 1);
const DEFAULT_TO_DATE = new Date();

class App extends React.Component<any, any> {

  api: MotionsApi = new MotionsApi();

  constructor(props: any) {
    super(props);
    this.state = {
      chart: {},
      fromDate: DEFAULT_FROM_DATE,
      toDate: DEFAULT_TO_DATE,
      motionsByParty: {},
      wordCloudData: [
        { text: 'Friedlich', value: this.randValue() },
        { text: 'Hanks', value: this.randValue() },
        { text: 'Tunnan', value: this.randValue() },
        { text: 'Le Bacon', value: this.randValue() },
        { text: 'Mr O', value: this.randValue() },
        { text: 'Big M', value: this.randValue() },
        { text: 'Luddas', value: this.randValue() },
        { text: 'Sejdis', value: this.randValue() },
        { text: 'Burn Hard', value: this.randValue() },
        { text: 'Leo', value: this.randValue() },
        { text: 'Seb-man', value: this.randValue() },
        { text: 'Seti', value: this.randValue() },
        { text: 'Positiv', value: this.randValue() },
        { text: 'Negativ', value: this.randValue() },
        { text: 'Neutral', value: this.randValue() },
      ]
    };

    this.setDate = this.setDate.bind(this);
  }

  randValue(): number {
    return Math.round(Math.random() * 1000);
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    this.setState({ chart: await this.api.getMotionsByParty(this.state.fromDate, this.state.toDate) });
  }

  setDate(fromChanged: Boolean, e: React.ChangeEvent<HTMLInputElement>) {
    if (fromChanged) {
      this.setState({ fromDate: e.target.value }, this.fetchData);
    } else {
      this.setState({ toDate: e.target.value }, this.fetchData);
    }
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
              <label> Från <input onChange={(e) => this.setDate(true, e)} value={this.state.fromDate} type="date"></input>
              </label>
            </Cell>
            <Cell medium={5}>
              <label> Till <input onChange={(e) => this.setDate(false, e)} value={this.state.toDate} type="date"></input>
              </label>
            </Cell>
            <Cell>
              <Chart
                fromDate={this.state.fromDate}
                toDate={this.state.toDate}
                results={this.state.chart.results} />
            </Cell>

            <Cell medium={4}>4 cols</Cell>
            <Cell medium={8}><WordCloud data={this.state.wordCloudData}></WordCloud></Cell>

          </Grid>
        </GridContainer>


      </div >
    );
  }
}
export default App;

