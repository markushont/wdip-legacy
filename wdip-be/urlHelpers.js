const MOTION_QUERY_DYNAMIC = 'http://data.riksdagen.se/dokumentlista/?sok=&doktyp=mot&rm=&from={}&tom={}&ts=&bet=&tempbet=&nr=&org=&iid=&parti=S&parti=M&parti=L&parti=KD&parti=V&parti=SD&parti=C&parti=MP&parti=NYD&parti=-&webbtv=&talare=&exakt=&planering=&sort=datum&sortorder=asc&rapport=&utformat=json&a=s#soktraff';

const PROPOSITION_QUERY_DYNAMIC = 'http://data.riksdagen.se/dokumentlista/?sok=&doktyp=prop&rm=&from={}&tom={}&ts=&bet=&tempbet=&nr=&org=&iid=&webbtv=&talare=&exakt=&planering=&sort=datum&sortorder=asc&rapport=&utformat=json&a=s#soktraff';

const DOC_STATUS_QUERY_DYNAMIC = 'http://data.riksdagen.se/dokumentstatus/{}.json';

String.prototype.format = function () {
  var i = 0, args = arguments;
  return this.replace(/{}/g, function () {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
};

module.exports.getMotionQuery = (fromString, toString) => {
  return MOTION_QUERY_DYNAMIC.format(fromString, toString);
};

module.exports.getPropositionQuery = (fromString, toString) => {
  return PROPOSITION_QUERY_DYNAMIC.format(fromString, toString);
};

module.exports.getDocStatusQuery = (docId) => {
  return DOC_STATUS_QUERY_DYNAMIC.format(docId);
};
