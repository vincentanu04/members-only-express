const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport');

exports.signup_get = asyncHandler(async (req, res, next) => {
  if (req.user) {
    res.redirect('/posts');
  }
  res.render('signup');
});

exports.signup_post = [
  body('username')
    .custom(async (value, { req }) => {
      if (!value) {
        throw new Error('Username must be specified.');
      }
      if (await User.findOne({ username: req.body.username })) {
        throw new Error('User already exists.');
      }
      if (value.length < 3) {
        throw new Error('Username must be at least 3 characters.');
      }
      return true;
    })
    .escape(),
  body('password').custom((value) => {
    if (!value) {
      throw new Error('Password must be specified.');
    }
    if (value.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    return true;
  }),
  body('confirmPassword').custom((value, { req }) => {
    if (!value) {
      throw new Error('Password confirmation must be specified.');
    } else if (value === req.body.password) {
      return true;
    } else {
      throw new Error('Passwords must be matching.');
    }
  }),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const user = {
      username: req.body.username,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    };

    if (!errors.isEmpty()) {
      const errorArray = errors.array();
      res.render('signup', {
        user,
        usernameErr: errorArray.find((e) => e.path === 'username'),
        passwordErr: errorArray.find((e) => e.path === 'password'),
        confirmPasswordErr: errorArray.find(
          (e) => e.path === 'confirmPassword'
        ),
      });

      return;
    }

    bcrypt.hash(req.body.username, 10, async (err, hashedPassword) => {
      if (err) next(err);

      await User.create({
        username: req.body.username,
        password: hashedPassword,
        member: false,
      });
    });
  }),
];

exports.login_get = asyncHandler(async (req, res, next) => {
  res.render('login');
});

exports.login_post = [
  body('username').custom(async (value, { req }) => {
    if (!value) {
      throw new Error('Username must be specified.');
    }

    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      throw new Error('User does not exist.');
    }
    return true;
  }),
  body('password').custom(async (value, { req }) => {
    if (!value) {
      throw new Error('Password must be specified.');
    }

    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return new Error();
    }

    const match = await bcrypt.compare(value, user.password);
    if (!match) {
      throw new Error('Password is incorrect.');
    }

    return true;
  }),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      res.render('login', {
        username: req.body.username,
        usernameErr: errorsArray.find((err) => err.path === 'username'),
        passwordErr: errorsArray.find((err) => err.path === 'password'),
      });

      return;
    }
    next();
  }),
  passport.authenticate('local', {
    successRedirect: '/posts',
    failureRedirect: '/posts',
  }),
];
