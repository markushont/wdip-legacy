import logger from "../logger";

export default async function getWordClound() {
  logger.debug("Calculating word cloud data.");
  return [
    { text: "Friedlich", value: randValue() },
    { text: "Hanks", value: randValue() },
    { text: "Tunnan", value: randValue() },
    { text: "Le Bacon", value: randValue() },
    { text: "Mr O", value: randValue() },
    { text: "Big M", value: randValue() },
    { text: "Luddas", value: randValue() },
    { text: "Sejdis", value: randValue() },
    { text: "Burn Hard", value: randValue() },
    { text: "Leo", value: randValue() },
    { text: "Seb-man", value: randValue() },
    { text: "Seti", value: randValue() },
    { text: "Positiv", value: randValue() },
    { text: "Negativ", value: randValue() },
    { text: "Neutral", value: randValue() }
  ];
}

function randValue(): number {
  return Math.round(Math.random() * 1000);
}
