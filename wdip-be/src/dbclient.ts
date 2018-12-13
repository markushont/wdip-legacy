import { Client } from "elasticsearch";
import { ES_SERVER } from "./config/config";

export const dbClient = new Client({
    host: ES_SERVER,
    log: "info"
});

export default dbClient;
