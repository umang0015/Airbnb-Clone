require('dotenv').config();


const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dns = require('dns');
const Listing = require('./models/listing');
// const MONGO_URL = 'mongodb://127.0.0.1:27017/Mangoo';
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/expresserror');
const { listingSchema, reviewSchema } = require('./schema');
const Review = require('./models/review');
const session = require('express-session');
const { default: MongoStore } = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const listingRouter = require('./routes/listing');
const reviewRouter = require('./routes/review');
const userRouter = require('./routes/user');
const { MongoTailableCursorError } = require('mongodb');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const dbUrl = process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/Mangoo';

async function main() {
  try {
    await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferCommands: true,
    });
    console.log('connected to db');
  } catch (err) {
    console.log('DB connection failed:', err.message);
    console.log('Starting server without DB connection...');
  }
}

main().then(() => {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

// index route
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret: 'mysupersecretcode',
  touchAfter: 24 * 3600,
});

store.on('error', (err) => {
  console.log('ERROR in Mongo Session', err);
});
const sessionOptions = {
  store,
  secret: 'mysupersecretcode',
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// app.get('/', (req, res) => {
//   res.send('Hello this is a root directory');
// });

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

const multer = require('multer');

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('MULTER ERROR:', err.code, err.message);
    req.flash('error', 'File upload error: ' + err.message);
    return res.redirect('back');
  }
  next(err);
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
  // res.status(statusCode).send(message);
  res.render('error.ejs', { statusCode, message });
});
