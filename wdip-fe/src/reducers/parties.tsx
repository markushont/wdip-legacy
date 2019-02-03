import { Party } from 'src/service/wdip-be';

export const GET_PARTY_DATA_SUCCESS = 'GET_PARTY_DATA_SUCCESS'

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
