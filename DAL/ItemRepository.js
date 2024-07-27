const con = require('./DBconnection');

function getItems(callback) {
    con.query('SELECT * FROM item', function (error, results, fields) {
        if (error) return callback(error, null);

        if (results.length > 0) {
            callback(null, results);
        } else {
            callback('No items found!', null);
        }
    });
}

function addItem(item, callback) {
    const query = 'INSERT INTO item SET ?';
    con.query(query, item, function (error, results, fields) {
        if (error) return callback(error, null);
        callback(null, 'Item added successfully');
    });
}

function deleteItem(itemId, callback) {
    con.beginTransaction(function (err) {
        if (err) { throw err; }

        const deleteOrderItemQuery = 'DELETE FROM order_item WHERE itemid = ?';
        con.query(deleteOrderItemQuery, [itemId], function (error, results, fields) {
            if (error) {
                return con.rollback(function () {
                    callback(error);
                });
            }

            const deleteItemQuery = 'DELETE FROM item WHERE iditem = ?';
            con.query(deleteItemQuery, [itemId], function (error, results, fields) {
                if (error) {
                    return con.rollback(function () {
                        callback(error);
                    });
                }
                con.commit(function (err) {
                    if (err) {
                        return con.rollback(function () {
                            callback(err);
                        });
                    }
                    callback(null);
                });
            });
        });
    });
}

function updateItem(itemId, updatedItem, callback) {
    const query = 'UPDATE item SET ? WHERE iditem = ?';
    con.query(query, [updatedItem, itemId], function (error, results, fields) {
        if (error) return callback(error, null);
        callback(null, 'Item updated successfully');
    });
}
function getItemById(itemId, callback) {
    const query = 'SELECT * FROM item WHERE iditem = ?';
    con.query(query, [itemId], function (error, results, fields) {
        if (error) return callback(error, null);

        if (results.length > 0) {
            callback(null, results[0]);
        } else {
            callback('Item not found', null);
        }
    });
}

function saveItemsToOrder(userId, cartItems, callback) {
    // First, calculate the total for the order
    let total = 0;
    for (const itemId in cartItems) {
        const item = cartItems[itemId];
        total += item.price * item.quantity;
    }
    total += total * 0.1;

    const orderQuery = 'INSERT INTO `order` (userid, total, date) VALUES (?, ?, ?)';
    con.query(orderQuery, [userId, total, new Date()], function (error, results) {
        if (error) {
            console.error('Error in saveItemsToOrder:', error);
            callback(error, null);
        } else {
            // Get the ID of the order we just inserted
            const orderId = results.insertId;

            // Now we can insert the items into the OrderItems table
            const valuesToInsert = [];
            for (const itemId in cartItems) {
                const item = cartItems[itemId];
                valuesToInsert.push([orderId, itemId, item.quantity, item.price]);
            }

            const itemsQuery = 'INSERT INTO `order_item` (orderid, itemid, quantity, price_per_one) VALUES ?';
            con.query(itemsQuery, [valuesToInsert], function (error, results) {
                if (error) {
                    console.error('Error in saveItemsToOrder:', error);
                    callback(error, null);
                } else {
                    callback(null, { message: 'Your order has been placed successfully' });
                }
            });
        }
    });
}

module.exports = {
    getItems,
    addItem,
    deleteItem,
    updateItem,
    getItemById,
    saveItemsToOrder
};