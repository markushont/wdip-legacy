const constants = {
    LOCAL_DB_PATH: 'localhost:9200'
};

const indices = {
    MOTION_TABLE: 'motions',
    MOTION_REQUEST_LOG_TABLE: 'motion-request-log',
    PENDING_INDEX: 'pending-motions-index'
}

module.exports = {constants, indices};
