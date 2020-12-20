const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const user = require('../controllers/users')
const passport = require('passport')


router.route('/register')
    .get(user.renderRegister)
    .post(catchAsync(user.registerSaveToDB))

router.route('/login')
    .get(catchAsync(user.renderLogin))
    .post(passport.authenticate('local', {failureFlash:true, failureRedirect:'/login'}), user.login)

router.get('/logout', user.logout)

module.exports = router;