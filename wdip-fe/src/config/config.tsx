import * as moment from "moment";
import { Configuration } from "../service/wdip-be";

class WDIPFrontendConfig {
    DEFAULT_FROM_DATE: moment.Moment = moment("2000-01-01");
    DEFAULT_TO_DATE: moment.Moment = moment();
    API_URL: string = "http://localhost:3001";

    apiConfig: Configuration;

    public get apiConfiguration(): Configuration {
        return this.apiConfig;
    }

    constructor() {
        const env = process.env;

        /* react-scripts-ts requires env vars to be prefixed
         * with 'REACT_APP_'
         */
        this.API_URL = env.REACT_APP_API_URL || this.API_URL;

        if (env.DEFAULT_FROM_DATE) {
            this.DEFAULT_FROM_DATE = moment(env.DEFAULT_FROM_DATE);
        }
        if (env.DEFAULT_TO_DATE) {
            this.DEFAULT_TO_DATE = moment(env.DEFAULT_FROM_DATE);
        }

        this.apiConfig = new Configuration({
            basePath: this.API_URL
        });
    }
}

export const config: WDIPFrontendConfig = new WDIPFrontendConfig();
