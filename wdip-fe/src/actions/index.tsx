import * as moment from "moment";
import { Party, MotionsByParty, Motion, Motions } from "src/service/wdip-be";

export const GET_MOTIONS_BY_PARTY_SUCCESS = 'GET_MOTIONS_BY_PARTY_SUCCESS'
export const GET_PARTY_DATA_SUCCESS = 'GET_PARTY_DATA_SUCCESS'
export const HANDLE_DATE_CHANGE = 'HANDLE_DATE_CHANGE'
export const GET_MOTION_DATA_SUCCESS = 'GET_MOTION_DATA_SUCCESS'
export const GET_MOTIONS_FOR_PARTY_SUCCESS = 'GET_MOTIONS_FOR_PARTY_SUCCESS'

export function getMotionByPartySuccess (result: MotionsByParty) {
    return {type: GET_MOTIONS_BY_PARTY_SUCCESS, payload: result}
}

export function getPartyDataSuccess (result: Party[]) {
    return {type: GET_PARTY_DATA_SUCCESS, payload: result}
}

export function handleDateChange (values: number[]) {
    return {type: HANDLE_DATE_CHANGE, payload: {fromDate: moment(`${values[0]}-01-01`), toDate: moment(`${values[1]}-01-01`)}}
}

export function getMotionDataSuccess (result: Motion) {
    return {type: GET_MOTION_DATA_SUCCESS, payload: [result]}
}

export function getMotionsForPartySuccess (result: Motions) {
    return {type: GET_MOTIONS_FOR_PARTY_SUCCESS, payload: result}
}
