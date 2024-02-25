require('dotenv').config();
const express = require('express');
const path = require('path');
const indexRouter = require('./src/routes/index');
const User = require('./src/models/user');

const app = express();
const port = process.env.port || 3001;

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
}

const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({ username: username });
    return done(null, user);
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'src/public')));
app.use(express.json());
app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/', indexRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });

  return;
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
