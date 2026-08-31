require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/expresserror');
const session = require('express-session');
const { default: MongoStore } = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const listingRouter = require('./routes/listing');
const reviewRouter = require('./routes/review');
const userRouter = require('./routes/user');

const dbUrl = process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/Mangoo';

// Connect to DB without blocking server startup (Render health check needs immediate listen)
async function main() {
  try {
    await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    });
    console.log('connected to db');
  } catch (err) {
    console.log('DB connection failed:', err.message);
    console.log('Check ATLASDB_URL and Atlas IP whitelist (0.0.0.0/0)');
  }
}
main();

// View engine & middleware - must be BEFORE routes and BEFORE listen
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const secret = process.env.SECRET || 'mysupersecretcode';

const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret: secret,
  touchAfter: 24 * 3600,
  crypto: {
    secret: secret,
  },
});

store.on('error', (err) => {
  console.log('ERROR in Mongo Session Store', err.message);
});

const sessionOptions = {
  store,
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currUser = req.user;
  next();
});

// Handle multer errors globally
const multer = require('multer');
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('MULTER ERROR:', err.code, err.message);
    req.flash('error', 'File upload error: ' + err.message);
    return res.redirect('back');
  }
  next(err);
});

// Routes
app.get('/', (req, res) => {
  res.redirect('/listings');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK - DB: ' + mongoose.connection.readyState);
});

app.get('/demouser', async (req, res) => {
  let fakeUser = new User({
    email: 'student@gmail.com',
    username: 'delta-student',
  });
  let registeredUser = await User.register(fakeUser, 'helloworld');
  res.send(registeredUser);
});

app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', userRouter);

app.use((req, res, next) => {
  next(new ExpressError(404, 'Page Not Found'));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = 'something went wrong!' } = err;
  res.status(statusCode).render('error.ejs', { statusCode, message });
});

// IMPORTANT: Listen at the very end, immediately - don't wait for DB
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
