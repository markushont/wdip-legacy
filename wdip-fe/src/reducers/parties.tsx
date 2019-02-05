import { Party } from 'src/service/wdip-be';
import { GET_PARTY_DATA_SUCCESS } from 'src/actions';

export interface PartiesState {
    partyData?: Party[];
}

const initialState = {
    partyData: []
}

interface GetPartySuccessAction {
  type: typeof GET_PARTY_DATA_SUCCESS
  payload: Party[]
}

export default function parties(state: PartiesState = initialState, action: GetPartySuccessAction): PartiesState {
    switch (action.type) {
        case GET_PARTY_DATA_SUCCESS: 
            return {
                ...state,
                partyData: action.payload,
            }
        default:
            return state
    }
}
