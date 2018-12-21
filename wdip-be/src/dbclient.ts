import { Client } from "elasticsearch";
import config from "./config/config";

export const dbClient = new Client({
    host: config.ES_SERVER,
    log: "info"
});

export default dbClient;
