const https = require('https');
const express = require('express');
const DB = require('../DAL/UserRepository');
const router = express.Router();
const bcrypt = require('bcrypt');


router.post('/signup', async (req, res) => {
    const { username, email, password, birthdate, recaptchaResponse } = req.body;
    const secretKey = '6LfMdSMpAAAAABE2ocyLP8K1JLi1wL_I1W4ejXG3';
    
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;
    
    // Server-side validation
    const errors = [];
    if (!username) {
      errors.push({ field: 'username', message: 'Username cannot be empty.' });
    }
    
    if (!password.match(/\d/) || password.length < 8) {
      errors.push({ field: 'password', message: 'Password must contain a number and be at least 8 characters long.' });
    }
    
    const age = new Date().getFullYear() - new Date(birthdate).getFullYear();
    if (age < 18) {
      errors.push({ field: 'birthdate', message: 'You must be at least 18 years old.' });
    }

    if (errors.length > 0) {
      return res.json({ errors });
    }
    
    // Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    https.get(verifyUrl, (resp) => {
      let data = '';
    
      resp.on('data', (chunk) => {
        data += chunk;
      });
    
      resp.on('end', () => {
        if (JSON.parse(data).success) {
          DB.insertUser(username, email, hashedPassword, birthdate, (err, newUser) => {
              if (err) {
                  if (err === 'User already exists!')
                      res.json({ errors: [{ field: 'general', message: err }] });
                  else {
                      console.error('Error:', err);
                      res.json({ errors: [{ field: 'general', message: 'An error occurred during user creation.' }] });
                  }
            } else {
              res.json({ message: 'Signup successful!' });
            }
          });
        } else {
          res.json({ errors: [{ field: 'recaptcha', message: 'Signup failed. Please try again.' }] });
        }
      });
    
    }).on("error", (err) => {
      console.error('Error:', err);
      res.status(500).json({ errors: [{ field: 'general', message: 'An error occurred during reCAPTCHA verification.' }] });
    });
});


router.post('/login', (req, res) => {
    const { username, password, loginType } = req.body;

    if (loginType === 'customer') {
        DB.signInUser(username, password, function (error, user) {
            if (error) {
                res.json({ info: 'Wrong credentials!' });
            } else if (user) {
                req.session.user = user;
                req.session.save();
                res.json({ info: 'Sign in successful!' });
            } else {
                res.json({ info: 'An error occured!' });
            }
        });
    }
    else if (loginType === 'admin') {
        DB.signInAdmin(username, password, function (error, user) {
            if (error) {
                res.json({ info: 'Wrong credentials!' });
            } else if (user) {
                req.session.user = user;
                req.session.save();
                res.json({ info: 'Welcome admin!' });
            } else {
                res.json({ info: 'An error occured!' });
            }
        });
    }
});

router.get('/checkUserType', (req, res) => {
    if (req.session.user && req.session.user.email) {
        res.json({ userType: 'customer' });
    } else if (req.session.user) {
        res.json({ userType: 'admin' });
    } else {
        res.json({ userType: 'unknown' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).json({ error: 'Failed to logout' });
        } else {
            res.json({ message: 'Logout successful' });
        }
    });
});

router.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    DB.saveContactMessage(name, email, message, function (error, result) {
        if (error) {
            res.status(500).json({ info: 'Error occurred while sending message!' });
        } else {
            res.json({ info: 'Message sent successfully!' });
        }
    });
});

module.exports = router;
