import * as React from 'react';
import './App.css';

import { GridContainer, Grid, Cell } from 'react-foundation';
import Header from './Header';
import MotionsByParty from './MotionsPerParty';
import { MotionsApi } from './service/wdip-be';
import WordCloud from './modules/WordCloud';

class App extends React.Component<any, any> {

  api: MotionsApi = new MotionsApi();

  constructor(props: any) {
    super(props);
    this.state = {
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
  }

  randValue(): number {
    return Math.round(Math.random() * 1000);
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
            <Cell medium={8}><WordCloud data={this.state.wordCloudData}></WordCloud></Cell>

          </Grid>
        </GridContainer>


      </div >
    );
  }
}

export default App;
