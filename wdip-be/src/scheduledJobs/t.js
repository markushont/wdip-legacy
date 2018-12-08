const axios = require("axios");
const logger = require("../logger");

async function getTest() {
    try {
        const doc1 = await axios.get("http://data.riksdagen.se/dokumentstatus/GN02Sk23.json");
        logger.info("doc1", doc1);

        const doc2 = await axios.get("http://data.riksdagen.se/dokument/GN02Ub32.text");
        logger.info("doc2", doc2);

    } catch (error) {
        logger.error(error);
    }
}

getTest();
