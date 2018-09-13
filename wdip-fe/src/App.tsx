import * as React from 'react';
import './App.css';

import { GridContainer, Grid, Cell } from 'react-foundation';
import Header from './Header';
import MotionsByParty from './MotionsPerParty';

class App extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
    this.state = { motionsByParty: {} };
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    let data = await fetch("http://localhost:3001/motions/byparty");
    this.setState({ motionsByParty: await data.json() });
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
