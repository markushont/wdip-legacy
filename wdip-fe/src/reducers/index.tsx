import { combineReducers } from 'redux';
import motions from './motions';
import parties from './parties';
import dates from './dates';

const rootReducer = combineReducers({
  motions, parties, dates
})

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
