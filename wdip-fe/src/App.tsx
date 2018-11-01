import * as React from 'react';
import './App.css';

import { GridContainer, Grid, Cell } from 'react-foundation';
import Header from './Header';
import { MotionsApi } from './service/wdip-be';
import Chart from './Chart';



class App extends React.Component<any, any> {

  api: MotionsApi = new MotionsApi();

  constructor(props: any) {
    super(props);
    this.setFromDate = this.setFromDate.bind(this);
    this.setToDate = this.setToDate.bind(this);
    this.state = { chart: {}, motionsByParty: {}, fromDate: '2000-09-19', toDate: '2012-10-11'};
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    this.setState({ chart: await this.api.getMotionsByParty(this.state.fromDate, this.state.toDate)});
  }

  setFromDate(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({fromDate: e.target.value});
  }

  setToDate(e: React.ChangeEvent<HTMLInputElement>){
    this.setState({toDate: e.target.value});
  }

  public render() {
    const fromDate = this.state.fromDate;
    const toDate = this.state.toDate;
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
           <label> Från <input onChange ={ this.setFromDate } value={fromDate} type="date"></input>
           </label>
           </Cell>
           <Cell medium={5}>
           <label> Till <input onChange={this.setToDate } value= {toDate} type="date"></input>
           </label> 
           </Cell>
           <Cell>
                <Chart
                  fromDate={this.state.chart.fromDate}
                  toDate={this.state.chart.toDate}
                  results={this.state.chart.results} />
            </Cell>

              <Cell medium={4}>{this.state.fromDate}</Cell>
              <Cell medium={8}>{this.state.toDate}</Cell>

          </Grid>
        </GridContainer>


      </div >
        );
      }
    }
    export default App;

