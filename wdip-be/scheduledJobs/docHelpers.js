'use strict';

const moment = require('moment');
const sizeof = require('object-sizeof');
const urlHelpers = require('./urlHelpers');
var errorHelper = require('./errorHelper');

////////////////////////////////////////////////////////////////////////////////

function parseBasicInfo(dok) {
  return({
    dok_id:     dok.dok_id,
    date:       dok.datum != undefined ? moment(dok.datum, "YYYY-MM-DD").valueOf() : -1,
    dateStr:    dok.datum,
    doktyp:     dok.doktyp,
    subtyp:     dok.subtyp,
    titel:      dok.sokdata != undefined ? dok.sokdata.titel : null,
    undertitel: dok.sokdata != undefined ? dok.sokdata.undertitel : null,
    //summary:    dok.summary
  });
}

////////////////////////////////////////////////////////////////////////////////

function parseForslag(dokForslag) {
  if (!dokForslag || !dokForslag.forslag) {
    return [];
  }
  const forslag = dokForslag.forslag;

  let ret = [];
  function parseItem(item) {
    ret.push({
      nummer:              item.nummer,
      beteckning:          item.beteckning,
      beslutstyp:          item.beslutstyp,
      lydelse:             item.lydelse,
      lydelse2:            item.lydelse2,
      utskottet:           item.utskottet,
      kammaren:            item.kammaren,
      behandlas_i:         item.behandlas_i,
      behandlas_i_punkt:   item.behandlas_i_punkt,
      kammarebeslutstyp:   item.kammarebeslutstyp,
      intressent:          item.intressent,
      avsnitt:             item.avsnitt,
      grundforfattning:    item.grundforfattning,
      andringsforfattning: item.andringsforfattning
    }); 
  }

  if (forslag.constructor == Array) {
    forslag.forEach(parseItem);
  } else {
    parseItem(forslag);
  }
  return ret;
}

////////////////////////////////////////////////////////////////////////////////

function parseIntressent(dokIntressent) {
  if (!dokIntressent || !dokIntressent.intressent) {
    return [];
  }
  const intressent = dokIntressent.intressent;
  let ret = [];

  function parseItem(item) {
    ret.push({
      intressent_id: item.intressent_id,
      namn:          item.namn,
      partibet:      item.partibet,
      ordning:       item.ordning,
      roll:          item.roll
    });
  }

  if (intressent.constructor == Array) {
    intressent.forEach(parseItem);
  } else {
    parseItem(intressent);
  }
  return ret;
}

////////////////////////////////////////////////////////////////////////////////

function parseUppgift(dokUppgift) {
  if (!dokUppgift || !dokUppgift.uppgift) {
    return [];
  }
  const uppgift = dokUppgift.uppgift;

  let ret = [];
  function parseItem(item) {
    ret.push({
      kod:         item.kod,
      namn:        item.namn,
      text:        item.text,
      dok_id:      item.dok_id,
      systemdatum: item.systemdatum
    });
  }

  if (uppgift.constructor == Array) {
    uppgift.forEach(parseItem);
  } else {
    parseItem(uppgift);
  }
  return ret;
}

////////////////////////////////////////////////////////////////////////////////

function parseStatus(dokument) {
  if (!dokument || !dokument.status) return "";
  return dokument.status;
}

////////////////////////////////////////////////////////////////////////////////

function parsePending(dokforslag) {
  if (dokforslag.forslag) {
    if (dokforslag.forslag.constructor == Array) {
      for (var i = 0; i < dokforslag.forslag.length(); ++i) {
        const item = dokforslag.forslag[i];
        if (item.utskottet.toLowerCase() === "avslag" || item.kammaren.toLowerCase() === "bifall" ||
          item.utskottet.toLowerCase() === "bifall" || item.kammaren.toLowerCase() === "avslag") {
          continue;
        }
        return true;
      }
    } else {
      const item = dokforslag.forslag;
      if (item.utskottet.toLowerCase() != "avslag" && item.kammaren.toLowerCase() != "bifall" &&
        item.utskottet.toLowerCase() != "bifall" && item.kammaren.toLowerCase() != "avslag") {
        return true;
      }
    }
  }

  return false;
}

////////////////////////////////////////////////////////////////////////////////

function parseStatusObj(statusObj) {
  let statusInfo = {};

  statusInfo.forslag = parseForslag(statusObj.dokforslag);
  statusInfo.intressent = parseIntressent(statusObj.dokintressent);
  statusInfo.uppgift = parseUppgift(statusObj.dokuppgift);
  statusInfo.status = parseStatus(statusObj.dokument);

  if (statusInfo.status === "Klar" || statusInfo.status === "ocr") {
    statusInfo.isPending = false;
  } else {
    statusInfo.isPending = parsePending(statusObj.dokument);
  }

  return statusInfo;
}

////////////////////////////////////////////////////////////////////////////////

module.exports = {
  parseBasicInfo:  parseBasicInfo,
  parseForslag:    parseForslag,
  parseIntressent: parseIntressent,
  parseUppgift:    parseUppgift,
  parseStatus:     parseStatus,
  parsePending:    parsePending,
  parseStatusObj:  parseStatusObj,
}
