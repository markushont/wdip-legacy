import * as moment from "moment";
import { Party, MotionsByParty, Motion, Motions } from "src/service/wdip-be";

export const GET_MOTIONS_BY_PARTY = 'GET_MOTIONS_BY_PARTY'
export const GET_MOTIONS_BY_PARTY_SUCCESS = 'GET_MOTIONS_BY_PARTY_SUCCESS'
export const GET_MOTIONS_BY_PARTY_FAILURE = 'GET_MOTIONS_BY_PARTY_FAILURE'

export const GET_PARTY_DATA = 'GET_PARTY_DATA'
export const GET_PARTY_DATA_SUCCESS = 'GET_PARTY_DATA_SUCCESS'
export const GET_PARTY_DATA_FAILURE = 'GET_PARTY_DATA_FAILURE'
export const HANDLE_DATE_CHANGE = 'HANDLE_DATE_CHANGE'

export const GET_MOTION_DATA = 'GET_MOTION_DATA'
export const GET_MOTION_DATA_SUCCESS = 'GET_MOTION_DATA_SUCCESS'
export const GET_MOTION_DATA_FAILURE = 'GET_MOTION_DATA_FAILURE'

export const GET_MOTIONS_FOR_PARTY = 'GET_MOTIONS_FOR_PARTY'
export const GET_MOTIONS_FOR_PARTY_SUCCESS = 'GET_MOTIONS_FOR_PARTY_SUCCESS'
export const GET_MOTIONS_FOR_PARTY_FAILURE = 'GET_MOTIONS_FOR_PARTY_FAILURE'

import { MotionsApi } from "src/service/wdip-be";

let motionsApi: MotionsApi = new MotionsApi();

export function getMotionByPartySuccess (result: MotionsByParty) {
    return {type: GET_MOTIONS_BY_PARTY_SUCCESS, payload: result}
}

export function getPartyDataSuccess (result: Party[]) {
    return {type: GET_PARTY_DATA_SUCCESS, payload: result}
}

export function handleDateChange (values: number[], id?: string) {
    return {type: HANDLE_DATE_CHANGE, payload: {fromDate: moment(`${values[0]}-01-01`), toDate: moment(`${values[1]}-01-01`), id}}
}

export async function handleDirectEnterMotionsView (id: string, fromDate: any, toDate: any) {
    const result =  await motionsApi.getMotionsForParty({id, fromDate, toDate})
    return {type: GET_MOTIONS_FOR_PARTY_SUCCESS, payload: result}
}

export function getMotionDataSuccess (result: Motion) {
    return {type: GET_MOTION_DATA_SUCCESS, payload: [result]}
}

export function getMotionsForPartySuccess (result: Motions) {
    return {type: GET_MOTIONS_FOR_PARTY_SUCCESS, payload: result}
}
