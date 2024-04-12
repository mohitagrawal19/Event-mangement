const jwt = require('jsonwebtoken');
const secretKey1=require('./Secreatkey')
const generateVerificationToken = (email) => {
    const secretKey = secretKey1();
    const email1='ma.7693849@gmail.com';
    return jwt.sign({ email1 }, secretKey, { expiresIn: '1h' });
};

module.exports = generateVerificationToken;
