
import { Action } from 'redux'
import { Motion } from 'src/service/wdip-be';

export interface MotionsState {
    currentMotion?: Motion;
    motions: any;
}

const initialState = {
    motions: {}
}
export const GET_MOTION_DATA_SUCCESS = 'GET_MOTION_DATA_SUCCESS'
export const GET_MOTIONS_SUCCESS = 'GET_MOTIONS_SUCCESS'

interface GetMotionSuccessAction {
  type: typeof GET_MOTION_DATA_SUCCESS
  payload: Array<Motion>
}

interface GetMotionsSuccessAction {
    type: typeof GET_MOTIONS_SUCCESS
    payload: Array<Motion>
  }

export default function motions(state: MotionsState = initialState, action: GetMotionSuccessAction | GetMotionsSuccessAction): MotionsState {
    switch (action.type) {
        case GET_MOTION_DATA_SUCCESS: 
            return {
                currentMotion: action.payload[0],
                motions: {
                    ...state.motions,
                    [action.payload[0].id]: action.payload
                }
            }
        // case GET_MOTIONS_SUCCESS: 
        //     return {
        //         currentMotion: action.payload[0],
        //         motions: {
        //             ...state.motions,
        //             [action.payload[0].id]: action.payload
        //         }
        //     }
      default:
        return state
    }
}
