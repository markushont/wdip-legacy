import { MotionsApi, PartyApi, Party, MotionsByParty } from "./service/wdip-be";
import * as moment from "moment";

let motionsApi: MotionsApi = new MotionsApi();
let partyApi: PartyApi = new PartyApi();

export const getMotionsByParty = async(getMotionByPartySuccess: (result: MotionsByParty) => any, motionsApi: MotionsApi, fromDate: moment.Moment, toDate: moment.Moment) => {
  try {
      const result = await motionsApi.getMotionsByParty({
          fromDate: fromDate.format("YYYY-MM-DD"),
          toDate: toDate.format("YYYY-MM-DD"),
      });
      getMotionByPartySuccess(result);
  } catch (error) {
      console.error(error);
  }
} 

export const getPartyData = async(getPartyDataSuccess: (result: Party[]) => any, partyApi: PartyApi) => {
  try {
      getPartyDataSuccess(await partyApi.getAllParties());
  } catch (error) {
      console.error(error);
  }
}