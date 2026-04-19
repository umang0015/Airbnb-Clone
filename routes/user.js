const express = require('express');
const router = express.Router();
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware');
const ExpressError = require('../utils/expresserror');
const UserController = require('../controllers/users');

router
  .route('/signup')
  .get(UserController.rendersign)
  .post(wrapAsync(UserController.SignUp));

router
  .route('/login')
  .get(UserController.renderlogin)
  .post(
    saveRedirectUrl,
    passport.authenticate('local', {
      failureRedirect: 'login',
      failureFlash: true,
    }),
    UserController.login,
  );

router.get('/logout', UserController.logout);

module.exports = router;
