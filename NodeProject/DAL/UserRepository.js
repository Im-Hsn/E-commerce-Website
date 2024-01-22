const con = require('./DBconnection');
const bcrypt = require('bcrypt');

function signInUser(username, password, callback) {
    con.query('SELECT * FROM user WHERE username = ?', [username], function (error, results, fields) {
        if (error) return callback(error, null);

        if (results.length > 0) {
            bcrypt.compare(password, results[0].password, function (err, result) {
                if (result == true) {
                    callback(null, results[0]);
                } else {
                    callback('Wrong credentials!', null);
                }
            });
        } else {
            callback('Wrong credentials!', null);
        }
    });
}
function signInAdmin(username, password, callback) {
    con.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
        if (error) return callback(error, null);

        if (results.length > 0) {
            const user = results[0];
            callback(null, user);
        } else {
            callback('Wrong credentials!', null);
        }
    });
}


function insertUser(username, email, password, birthdate, callback) {
    con.query('SELECT * FROM user WHERE username = ? OR email = ?', [username, email], function (error, results, fields) {
        if (error) return callback(error, null);

        if (results.length > 0) {
            callback('User already exists!', null);
        } else {
            con.query(
                'INSERT INTO user (username, email, password, birthdate) VALUES (?, ?, ?, ?)',
                [username, email, password, birthdate],
                function (error, results, fields) {
                    if (error) return callback(error, null);

                    con.query('SELECT * FROM user WHERE iduser = ?', results.insertId, function (error, newUser, fields) {
                        if (error) return callback(error, null);
                        callback(null, newUser[0]);
                    });
                }
            );
        }
    });
}

function saveContactMessage(name, email, message, callback) {
    con.query(
        'INSERT INTO contact (name, email, message, date) VALUES (?, ?, ?, NOW())',
        [name, email, message],
        function (error, results, fields) {
            if (error) return callback(error, null);
            callback(null, results);
        }
    );
}

module.exports = {
    signInUser,
    signInAdmin,
    insertUser,
    saveContactMessage
};