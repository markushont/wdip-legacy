import { Party } from 'src/service/wdip-be';
import { GET_PARTY_DATA_SUCCESS, GET_MOTIONS_FOR_PARTY } from 'src/actions';

export interface PartiesState {
    partyData?: Party[];
    currentPartyId?: string;
}

const initialState = {
    partyData: [],
    currentPartyId: undefined
}

interface GetMotionsForPartyAction {
    type: typeof GET_MOTIONS_FOR_PARTY
    payload: any
}

interface GetPartySuccessAction {
  type: typeof GET_PARTY_DATA_SUCCESS
  payload: Party[]
}

export default function parties(state: PartiesState = initialState, action: GetPartySuccessAction | GetMotionsForPartyAction): PartiesState {
    switch (action.type) {
        case GET_MOTIONS_FOR_PARTY:
            return {
                ...state,
                currentPartyId: action.payload.id
            }
        case GET_PARTY_DATA_SUCCESS: 
            return {
                ...state,
                partyData: action.payload
            }
        default:
            return state
    }
}
