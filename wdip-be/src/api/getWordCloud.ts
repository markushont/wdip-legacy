import { WDIP_MOTION_INDEX } from "../config/config";
import dbClient from "../dbclient";
import logger from "../logger";

export default async function getWordCloud(fromDateStr, toDateStr) {

  const params = {
    index: WDIP_MOTION_INDEX,
    body: {
      query: {
        range: {
          dateStr: {
            gte: fromDateStr,
            lte: toDateStr
          }
        }
      },
      aggregations: {
        keywords: {
          significant_text:
          {
            field: "titel",
            min_doc_count: 2
          }
        }
      }
    }
  };

  try {
    const response = await dbClient.search(params);
    const buckets = response.aggregations.keywords.buckets;
    const words = buckets.map((word: any) =>  ({text: word.key, value: word.score}));
    return words;
  } catch (error) {
    logger.error("Error sending request in getWordCloud: ", error);
  }
}
