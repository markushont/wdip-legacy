'use strict';

const moment = require('moment')

////////////////////////////////////////////////////////////////////////////////

function _parseBasicInfo(dok) {
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

function _parseForslag(dokForslag) {
  if (dokForslag === undefined || dokForslag.forslag === undefined) {
    return [];
  }
  const forslag = dokForslag.forslag;

  var ret = [];
  function parseItem(item) {
    ret.push({
      nummer:              item.nummer,
      beteckning:          item.beteckning,
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

function _parseIntressent(dokIntressent) {
  if (dokIntressent === undefined || dokIntressent.intressent === undefined) {
    return [];
  }
  const intressent = dokIntressent.intressent;
  var ret = [];

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

function _parseUppgift(dokUppgift) {
  if (dokUppgift === undefined || dokUppgift.uppgift === undefined) {
    return [];
  }
  const uppgift = dokUppgift.uppgift;

  var ret = [];
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

function _parseStatus(dokument) {
  if (dokument === undefined || dokument.status === undefined) return "";
  return dokument.status;
}

////////////////////////////////////////////////////////////////////////////////

function _parsePending(dokforslag) {
  if (dokforslag.forslag != undefined) {
    if (dokforslag.forslag.constructor == Array) {
      for (var i = 0; i < dokforslag.forslag.length(); ++i) {
        var item = dokforslag.forslag[i];
        if (item.utskottet === "Avslag" || item.kammaren === "Bifall" ||
          item.utskottet === "Bifall" || item.kammaren === "Avslag") {
          continue;
        }
        return true;
      }
    } else {
      var item = dokforslag.forslag;
      if (item.utskottet != "Avslag" && item.kammaren != "Bifall" &&
        item.utskottet != "Bifall" && item.kammaren != "Avslag") {
        return true;
      }
    }
  }

  return false;
}

////////////////////////////////////////////////////////////////////////////////

module.exports = {
  parseBasicInfo:  _parseBasicInfo,
  parseForslag:    _parseForslag,
  parseIntressent: _parseIntressent,
  parseUppgift:    _parseUppgift,
  parseStatus:     _parseStatus,
  parsePending:    _parsePending
}
