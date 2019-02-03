import { config } from "../config/config";
import * as moment from "moment";

export const HANDLE_DATE_CHANGE = 'HANDLE_DATE_CHANGE'

export interface DatesState {
    fromDate?: moment.Moment;
    toDate?: moment.Moment;
}

const initialState = {
    fromDate: config.DEFAULT_FROM_DATE,
    toDate: config.DEFAULT_TO_DATE
}

interface handleDateChange {
  type: typeof HANDLE_DATE_CHANGE;
  payload: any;
}

export default function dates(state: DatesState = initialState, action: handleDateChange): DatesState {
    switch (action.type) {
        case HANDLE_DATE_CHANGE: 
            return {
                ...action.payload
            }
        default:
            return state
    }
}
