const pool = require("../db/db");

const subscribe = async (userId, clubId) => {
    const response = await pool.execute(
        "INSERT INTO subscribers (uid, cid) VALUES (?,?)",
        [userId, clubId]
    );
    return response;
};

const unsubscribe = async (userId, clubId) => {
    const response = await pool.execute(
        "DELETE FROM subscribers where uid=? AND cid=?",
        [userId, clubId]
    );
    return response;
};

const getSubscribersByCid = async (clubId) => {
    const [response] = await pool.execute(
        "SELECT * FROM subscribers WHERE cid=?",
        [clubId]
    );
    return response;
};

const getSubscribedClubsByUid = async (userId) => {
    const [response] = await pool.execute(
        "SELECT cid as clubId FROM subscribers WHERE uid=?",
        [userId]
    );
    return response;
};

module.exports = {
    subscribe,
    unsubscribe,
    getSubscribersByCid,
    getSubscribedClubsByUid,
};
