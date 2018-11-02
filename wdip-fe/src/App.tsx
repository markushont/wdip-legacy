import * as React from 'react';
import './App.css';

import { GridContainer, Grid, Cell } from 'react-foundation';
import Header from './Header';
import { MotionsApi } from './service/wdip-be';
import Chart from './Chart';
const DEFAULT_FROM_DATE = '2000-01-01';
const DEFAULT_TO_DATE = (new Date()).toISOString().substring(0, 10);



class App extends React.Component<any, any> {

  api: MotionsApi = new MotionsApi();

  constructor(props: any) {
    super(props);
    this.setDate = this.setDate.bind(this);
    this.state = { chart: {}, motionsByParty: {}, fromDate: DEFAULT_FROM_DATE, toDate: DEFAULT_TO_DATE };
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

          </Grid>
        </GridContainer>


      </div >
    );
  }
}
export default App;

