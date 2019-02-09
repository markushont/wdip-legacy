import { PartyApi, Party } from "src/service/wdip-be";
import { call, put, takeEvery } from "redux-saga/effects";
import { GET_PARTY_DATA, GET_PARTY_DATA_SUCCESS, GET_PARTY_DATA_FAILURE } from ".";

let partyApi: PartyApi = new PartyApi();

const getPartyDataSync = () => {
    return partyApi.getAllParties();
}

function * getPartyData() {
    try {
        const response = yield call(getPartyDataSync)
        yield put({type: GET_PARTY_DATA_SUCCESS, payload: response})
    } catch (e) {
        yield put({type: GET_PARTY_DATA_FAILURE, error: e})
    }
}

export function * partyDataSaga() {
    yield takeEvery(GET_PARTY_DATA, getPartyData)
}