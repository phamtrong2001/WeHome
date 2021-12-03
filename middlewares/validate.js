/**
 * Validate username & password
 */

module.exports.validate_user = function (username) {
    if (username.length < 5 || username.length > 20) {
        return false;
    }
    return true;
};

module.exports.validate_pass = function (username, password) {
    if (password.length < 8 || password.length > 50) {
        return false;
    }
    if (password.indexOf(username) != -1) {
        return false;
    }
    return true;
};