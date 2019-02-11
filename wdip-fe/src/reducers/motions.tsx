import { Motion, Motions, MotionsByParty } from 'src/service/wdip-be';
import { GET_MOTIONS_BY_PARTY_SUCCESS, GET_MOTION_DATA_SUCCESS, GET_MOTIONS_FOR_PARTY_SUCCESS } from 'src/actions';

export interface MotionsState {
    currentMotion?: Motion;
    motionsByParty?: any;
    motionsForParty?: any;
}

const initialState = {}

interface GetMotionSuccessAction {
  type: typeof GET_MOTION_DATA_SUCCESS
  payload: Motion
}

interface GetMotionsForPartySuccessAction {
    type: typeof GET_MOTIONS_FOR_PARTY_SUCCESS
    payload: Motions
}

interface GetMotionsByPartySuccessAction {
    type: typeof GET_MOTIONS_BY_PARTY_SUCCESS
    payload: MotionsByParty
}

export default function motions(state: MotionsState = initialState, action: GetMotionSuccessAction | GetMotionsForPartySuccessAction | GetMotionsByPartySuccessAction): MotionsState {
    switch (action.type) {
        case GET_MOTION_DATA_SUCCESS:
            return {
                ...state,
                currentMotion: action.payload
            }
        case GET_MOTIONS_FOR_PARTY_SUCCESS:
            return {
                ...state,
                motionsForParty: action.payload
            }
        case GET_MOTIONS_BY_PARTY_SUCCESS:
            return {
                ...state,
                motionsByParty: action.payload
            }
        default:
            return state
    }
}
