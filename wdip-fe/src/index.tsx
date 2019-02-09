import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import {createLogger} from 'redux-logger'
import * as moment from 'moment';

import rootReducer from './reducers';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import createSagaMiddleware from 'redux-saga'
import { GET_PARTY_DATA, GET_MOTIONS_BY_PARTY } from './actions';

import "jquery/dist/jquery.min.js"
import "foundation-sites/dist/css/foundation.min.css";
import "foundation-sites/dist/js/foundation.min.js";

import { partyDataSaga } from './actions/getPartyData';
import { motionDataSaga } from './actions/getMotionData';
import { config } from './config/config';

const sagaMiddleware = createSagaMiddleware();

const logger = createLogger();
const store = createStore(rootReducer, applyMiddleware(logger, sagaMiddleware));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement
);

sagaMiddleware.run(partyDataSaga);
sagaMiddleware.run(motionDataSaga);

store.dispatch({type: GET_PARTY_DATA})
store.dispatch({type: GET_MOTIONS_BY_PARTY, payload: {fromDate: config.DEFAULT_FROM_DATE.format("YYYY-MM-DD"), toDate: config.DEFAULT_TO_DATE.format("YYYY-MM-DD")}})

registerServiceWorker();
