const DB = require('../DAL/ItemRepository');
const express = require('express');
const multer = require('multer');
const upload = multer();
const router = express.Router();

router.get('/items', (req, res) => {
    DB.getItems((error, items) => {
        if (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred' });
        } else {
            res.json(items);
        }
    });
});

router.post('/addItem', upload.fields([{ name: 'Name', maxCount: 1 }, { name: 'Price', maxCount: 1 },
{ name: 'Type', maxCount: 1 }, { name: 'Image', maxCount: 1 }]), (req, res) => {
    const newItem = req.body;
    DB.addItem(newItem, (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred' });
        } else {
            res.json(result);
        }
    });
});

router.delete('/deleteItem/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    DB.deleteItem(itemId, (error) => {
        if (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred while deleting the item.' });
        } else {
            res.status(200).json({ message: `Item with ID ${itemId} has been deleted.` });
        }
    });
});

router.put('/updateItem/:itemId', upload.none(), (req, res) => {
    const itemId = req.params.itemId;
    const updatedItem = {
        Name: req.body.Name,
        Price: req.body.Price,
        Type: req.body.Type
    };

    DB.updateItem(itemId, updatedItem, (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred' });
        } else {
            res.json(result);
        }
    });
});

router.get('/getItem/:itemId', (req, res) => {
    const itemId = req.params.itemId;

    DB.getItemById(itemId, (error, item) => {
        if (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred' });
        } else {
            res.json(item);
        }
    });
});

router.post('/storeCartInSession', (req, res) => {
    const { cartItems } = req.body;
    req.session.cartItems = cartItems;
    req.session.save();
    res.sendStatus(200);
});

router.get('/emptyCartSession', (req, res) => {
    req.session.cartItems = null;
    req.session.save();
    res.sendStatus(200);
});

router.get('/checkout', (req, res) => {
    const cartItems = req.session.cartItems || {};

    DB.saveItemsToOrder(req.session.user.iduser, cartItems, (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to order items.' });
        } else {
            req.session.cartItems = null;
            res.json(result);
        }
    });
});

router.get('/getCartItems', (req, res) => {
    const cartItems = req.session.cartItems || {};
    res.json(cartItems);
});

module.exports = router;