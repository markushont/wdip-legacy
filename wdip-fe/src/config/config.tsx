import * as moment from "moment";

class WDIPFrontendConfig {
    DEFAULT_FROM_DATE: moment.Moment = moment("2000-01-01");
    DEFAULT_TO_DATE: moment.Moment = moment();

    constructor() {
        const env = process.env;

        if (env.DEFAULT_FROM_DATE) {
            this.DEFAULT_FROM_DATE = moment(env.DEFAULT_FROM_DATE);
        }
        if (env.DEFAULT_TO_DATE) {
            this.DEFAULT_TO_DATE = moment(env.DEFAULT_FROM_DATE);
        }
    }
}

export const config: WDIPFrontendConfig = new WDIPFrontendConfig();
