import * as moment from "moment";
import { Configuration } from "../service/wdip-be";

class WDIPFrontendConfig {
    DEFAULT_FROM_DATE: moment.Moment = moment("2000-01-01");
    DEFAULT_TO_DATE: moment.Moment = moment();
    API_URL: string = "http://localhost:3001";

    public get apiConfiguration(): Configuration {
        return {
            basePath: this.API_URL
        }
    }

    constructor() {
        const env = process.env;

        this.API_URL = env.API_URL || this.API_URL;

        if (env.DEFAULT_FROM_DATE) {
            this.DEFAULT_FROM_DATE = moment(env.DEFAULT_FROM_DATE);
        }
        if (env.DEFAULT_TO_DATE) {
            this.DEFAULT_TO_DATE = moment(env.DEFAULT_FROM_DATE);
        }
    }
}

export const config: WDIPFrontendConfig = new WDIPFrontendConfig();
