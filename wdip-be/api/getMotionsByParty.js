'use strict';

module.exports = async function getMotionsByParty(fromDateStrOverride = null, toDateStrOverride = null) {
    let data = {
        fromDate: fromDateStrOverride, toDate: toDateStrOverride, results: [
            { party: "M", submitted: 1, approved: 6, declined: 10 },
            { party: "L", submitted: 2, approved: 7, declined: 20 },
            { party: "C", submitted: 3, approved: 8, declined: 30 },
            { party: "V", submitted: 4, approved: 9, declined: 40 },
            { party: "S", submitted: 5, approved: 0, declined: 50 }
        ]
    };
    return data;
};
