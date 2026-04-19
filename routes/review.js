const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/expresserror');
const { reviewSchema } = require('../schema');
const Listing = require('../models/listing');
const Review = require('../models/review');
const { isLoggedIn } = require('../middleware');
const ReviewController = require('../controllers/review');


const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body.review);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

router.post(
  '/',
  isLoggedIn,
  validateReview,
  wrapAsync(ReviewController.createReview),
);

router.delete(
  '/:reviewId',
  isLoggedIn,
  wrapAsync(ReviewController.destroyReview),
);

module.exports = router;
