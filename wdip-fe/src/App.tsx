import * as React from 'react';
import './App.css';

import { GridContainer, Grid, Cell } from 'react-foundation';
import Header from './Header';
import MotionsByParty from './MotionsPerParty';
import { MotionsApi } from './service/wdip-be';
import Chart from './Chart';


class App extends React.Component<any, any> {

  api: MotionsApi = new MotionsApi();

  constructor(props: any) {
    super(props);
    this.state = { motionsByParty: {} };
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    this.setState({ motionsByParty: await this.api.getMotionsByParty() });
  }

  public render() {
    return (
      <div>
        <Header />
        
  
      <Chart />
        
        <GridContainer>
          <Grid >

            <Cell>
              <h1>WDIPs</h1>
            </Cell>

            <Cell>
              <h2>
                Motioner per parti
              </h2>
              <MotionsByParty
                fromDate={this.state.motionsByParty.fromDate}
                toDate={this.state.motionsByParty.toDate}
                results={this.state.motionsByParty.results} />
            </Cell>

            <Cell medium={4}>4 cols</Cell>
            <Cell medium={8}>8 cols</Cell>

          </Grid>
        </GridContainer>


      </div >
    );
  }
}

export default App;
