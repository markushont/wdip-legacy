import * as React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";


import Motions from './motions/Motions';

class App extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
  }

  public render() {
    return (
      <Router>
        <div className="app">
          <Switch>
            <Route exact path="/" component={() => {
              return (
                <div>
                  <h1>HELLO</h1>
                  <a href="motions">MOTIONS</a>
                </div>
              );}} />
            <Route path="/motions" component={Motions} />
          </Switch>
        </div>
      </Router>
    );
  }
}
export default App;
