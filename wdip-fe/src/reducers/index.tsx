import { combineReducers } from 'redux';
import motions from './motions';

const rootReducer = combineReducers({
  motions
})

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
