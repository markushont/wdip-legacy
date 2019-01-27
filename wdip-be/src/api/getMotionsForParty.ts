import { SearchResponse } from "elasticsearch";
import { Moment } from "moment";
import config from "../config/config";
import dbClient from "../dbclient";
import { transformMotion } from "./apiUtil";

const RESULTS_SIZE = 50;

export default async function getMotionsForParty(id: string, fromDate: Moment, toDate: Moment, fromResult?: number) {
    const fromDateStr = fromDate.format("YYYY-MM-DD");
    const toDateStr = toDate.format("YYYY-MM-DD");
    const requestObj = {
        index: config.WDIP_MOTION_INDEX,
        body: {
            _source: ["id", "documentStatus", "documentType", "proposals", "stakeholders"],
            size: RESULTS_SIZE,
            from: fromResult || 0,
            query: {
                bool: {
                    must: { match: { "stakeholders.party.id": id } },
                    filter: {
                        range: {
                            published: {
                                gte: fromDateStr,
                                lte: toDateStr
                            }
                        }
                    }
                }
            },
            sort: {
                _script: {
                    type: "number",
                    script: {
                        lang: "painless",
                        inline: `if(params.scores.containsKey(doc['documentStatus.keyword'].value)) {
                                    return params.scores[doc['documentStatus.keyword'].value];
                                 }
                                 return 100000;`,
                        params: {
                            scores: {
                                PENDING: 0,
                                APPROVED: 1,
                                REJECTED: 2
                            }
                        }
                    },
                    order: "asc"
              }
            }
        }
    };

    try {
        const dbResponse: SearchResponse<{}> = await dbClient.search(requestObj);
        const results = dbResponse.hits.hits.map(transformMotion);
        const total = dbResponse.hits.total;
        const startResult = fromResult || 0;
        const endResult = startResult + RESULTS_SIZE;
        return { results, total, startResult, endResult };
    } catch (error) {
        throw error;
    }
}
