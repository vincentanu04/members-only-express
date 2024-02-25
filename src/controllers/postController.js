exports.index = (req, res, next) => {
  if (req.user) {
    res.render('posts', { user: req.user });
  }
  res.render('posts');
};
