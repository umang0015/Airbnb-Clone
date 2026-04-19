const Listing = require('../models/listing');
const Review = require('../models/review');
const ExpressError = require('../utils/expresserror');
const { listingSchema, reviewSchema } = require('../schema');

module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview._id);
  await newReview.save();
  await listing.save();
  req.flash('success', 'New Review Created!');
  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Review.findByIdAndDelete(reviewId);
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  req.flash('success', 'Review deleted!');
  res.redirect(`/listings/${id}`);
};
