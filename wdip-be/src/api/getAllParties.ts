import logger from "../logger";

async function getAllParties() {
  /* Positions according to the parties themselves,
  from https://www.svt.se/special/partir%C3%B6sten-valjarna-och-partierna-om-ideologi/ */
  return {
    s: { x: 4, y: 4, color: "#e03141", name: "Socialdemokraterna" },
    m: { x: 9, y: 5, color: "#7cbde0", name: "Moderaterna" },
    l: { x: 6, y: 7, color: "##1e69aa", name: "Liberalerna" },
    kd: { x: 7, y: 6, color: "#00006d", name: "Kristdemokraterna" },
    v: { x: 0, y: 5, color: "#911414", name: "Vänsterpartiet" },
    sd: { x: 5, y: 4, color: "#ffc346", name: "Sverigedemokraterna" },
    c: { x: 6, y: 8, color: "#31a431", name: "Centerpartiet" },
    mp: { x: 3, y: 9, color: "#82c782", name: "Miljöpartiet" }
  };

}

module.exports = getAllParties;
