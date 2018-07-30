'use strict';

function _parseForslag(dokForslag) {
  if (dokForslag === undefined) return undefined;
  const forslag = dokForslag.forslag;

  var ret = { L: [] };
  forslag.forEach((item) => {
    ret.L.push({
      nummer:              { N: item.nummer },
      beteckning:          { N: item.beteckning },
      lydelse:             { S: item.lydelse },
      lydelse2:            { S: item.lydelse2 },
      utskottet:           { S: item.utskottet },
      kammaren:            { S: item.kammaren },
      behandlas_i:         { S: item.behandlas_i },
      behandlas_i_punkt:   { S: item.behandlas_i_punkt },
      kammarebeslutstyp:   { S: item.kammarebeslutstyp },
      intressent:          { S: item.intressent.toString() }, // May be Obj?
      avsnitt:             { S: item.avsnitt },
      grundforfattning:    { S: item.grundforfattning },
      andringsforfattning: { S: item.andringsforfattning }
    });
  });
  return ret;
}

////////////////////////////////////////////////////////////////////////////////

function _parseIntressent(dokIntressent) {
  if (dokIntressent === undefined) return undefined;
  const intressent = dokIntressent.intressent;

  var ret = { L: [] };
  intressent.forEach((item) => {
    ret.L.push({
      intressent_id: { S: item.intressent_id },
      namn:          { S: item.namn },
      partibet:      { S: item.partibet },
      ordning:       { N: item.ordning },
      roll:          { S: item.roll }
    });
  });
  return ret;
}

////////////////////////////////////////////////////////////////////////////////

function _parseUppgift(dokUppgift) {
  if (dokUppgift === undefined) return undefined;
  const uppgift = dokUppgift.uppgift;

  var ret = { L: [] };
  uppgift.forEach((item) => {
    ret.L.push({
      kod:         { S: item.kod },
      namn:        { S: item.namn },
      text:        { S: item.text },
      dok_id:      { S: item.dok_id },
      systemdatum: { S: item.systemdatum }
    });
  });
  return ret;
}

module.exports = {
  parseForslag: _parseForslag,
  parseIntressent: _parseIntressent,
  parseUppgift: _parseUppgift
}
