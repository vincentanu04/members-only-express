const asyncHandler = require('express-async-handler');
const Message = require('../models/message');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');

exports.index = asyncHandler(async (req, res, next) => {
  const messages = await Message.find()
    .sort({ timestamp: -1 })
    .populate('user')
    .exec();

  if (req.user) {
    res.render('posts', { user: req.user, messages });
  }
  res.render('posts', { messages });
});

exports.create_post = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Title must be specified.')
    .escape(),
  body('message')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Message must be specified.')
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      const messages = await Message.find()
        .sort({ timestamp: -1 })
        .populate('user')
        .exec();

      res.render('posts', {
        user: req.user,
        titleErr: errorsArray.find((err) => err.path === 'title'),
        messageErr: errorsArray.find((err) => err.path === 'message'),
        messages,
      });
      return;
    }

    await Message.create({
      title: req.body.title,
      message: req.body.message,
      timestamp: new Date(),
      user: req.user._id,
    });

    res.redirect('/posts');
  }),
];

exports.become_member = [
  body('answer').custom((value, { req }) => {
    if (!value) {
      throw new Error('Answer must be specified.');
    }
    if (value.toLowerCase() !== 'age') {
      throw new Error('Answer is incorrect.');
    }
    return true;
  }),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      const messages = await Message.find()
        .sort({ timestamp: -1 })
        .populate('user')
        .exec();
      res.render('posts', {
        user: req.user,
        answerErr: errorsArray.find((err) => err.path === 'answer'),
        messages,
      });

      return;
    }

    const updatedUser = new User({
      username: req.user.username,
      password: req.user.password,
      member: true,
      _id: req.user._id,
    });
    await User.findByIdAndUpdate(req.user._id, updatedUser);

    req.login(updatedUser, (err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/posts');
    });
  }),
];
