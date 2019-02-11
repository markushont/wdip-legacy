import { MotionsApi } from "src/service/wdip-be";
import { call, put, takeEvery } from "redux-saga/effects"
import { GET_MOTIONS_BY_PARTY_SUCCESS, GET_MOTIONS_BY_PARTY_FAILURE, GET_MOTIONS_BY_PARTY, GET_MOTION_DATA, GET_MOTION_DATA_SUCCESS, GET_MOTION_DATA_FAILURE, GET_MOTIONS_FOR_PARTY_SUCCESS, GET_MOTIONS_FOR_PARTY_FAILURE, GET_MOTIONS_FOR_PARTY, HANDLE_DATE_CHANGE } from ".";
import { config } from "src/config/config";

let motionsApi: MotionsApi = new MotionsApi(config.apiConfiguration);

const getMotionsByPartySync = (payload: any) => {
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

const getMotionsForPartySync = (payload: any) => {
    return motionsApi.getMotionsForParty(payload);
}
function * getMotionsForParty(body: any) {
    try {
        const response = yield call(getMotionsForPartySync, body.payload)
        yield put({type: GET_MOTIONS_FOR_PARTY_SUCCESS, payload: response})
    } catch (e) {
        yield put({type: GET_MOTIONS_FOR_PARTY_FAILURE, error: e})
    }
}

const getMotionDataSync = (payload: any) => {
    return motionsApi.getMotion({ id: payload });
}
function * getMotionData(body: any) {
    try {
        const response = yield call(getMotionDataSync, body.payload)
        yield put({type: GET_MOTION_DATA_SUCCESS, payload: response})
    } catch (e) {
        yield put({type: GET_MOTION_DATA_FAILURE, error: e})
    }
}

export function * motionDataSaga() {
    yield takeEvery([GET_MOTIONS_BY_PARTY, HANDLE_DATE_CHANGE], getMotionsByParty)
    yield takeEvery([GET_MOTIONS_FOR_PARTY, HANDLE_DATE_CHANGE], getMotionsForParty)
    yield takeEvery(GET_MOTION_DATA, getMotionData)
}
