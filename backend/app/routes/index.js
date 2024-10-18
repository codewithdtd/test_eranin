const express = require('express');
const router = express.Router();
const api = require('../controllers/user.controller');


router.route('/login').post(api.login);
router.route('/register').post(api.register);

module.exports = router;