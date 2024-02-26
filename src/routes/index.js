const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const formController = require('../controllers/formController');
const postController = require('../controllers/postController');

router.get('/', indexController.index);

router.get('/sign-up', formController.signup_get);
router.post('/sign-up', formController.signup_post);

router.get('/log-in', formController.login_get);
router.post('/log-in', formController.login_post);

router.get('/log-out', formController.logout_get);

router.get('/posts', postController.index);
router.post('/posts/new', postController.create_post);

router.post('/become-member', postController.become_member);

module.exports = router;
