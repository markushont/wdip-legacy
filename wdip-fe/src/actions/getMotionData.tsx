import { MotionsApi } from "src/service/wdip-be";
import { call, put, takeEvery } from "redux-saga/effects"
import { GET_MOTIONS_BY_PARTY_SUCCESS, GET_MOTIONS_BY_PARTY_FAILURE, GET_MOTIONS_BY_PARTY } from ".";
import * as moment from "moment";

let motionsApi: MotionsApi = new MotionsApi();

const getMotionsByPartySync = (payload: any) => {
    console.log('body.payload: ', payload)
    return motionsApi.getMotionsByParty(payload);
}

function * getMotionsByParty(body: any) {
    try {
        const response = yield call(getMotionsByPartySync, body.payload)
        yield put({type: GET_MOTIONS_BY_PARTY_SUCCESS, payload: response})
    } catch (e) {
        yield put({type: GET_MOTIONS_BY_PARTY_FAILURE, error: e})
    }
}

export function * motionDataSaga() {
    console.log('motionDataSaga!')
    yield takeEvery(GET_MOTIONS_BY_PARTY, getMotionsByParty)
}
