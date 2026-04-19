const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/expresserror');
const { listingSchema } = require('../schema');
const Listing = require('../models/listing');
const { isLoggedIn, isOwner, validateListing } = require('../middleware');
const ListingController = require('../controllers/listing');
const multer = require('multer');
const { storage } = require('../cloudConfig');
const upload = multer({ storage });

router
  .route('/')
  .get(wrapAsync(ListingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(ListingController.createListing),
  );


router.get('/new', isLoggedIn, ListingController.renderNewForm);

router
  .route('/:id')
  .get(wrapAsync(ListingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(ListingController.UpdateListing),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(ListingController.DestroyListing));

//show route

router.get(
  '/:id/edit',
  isLoggedIn,
  isOwner,
  wrapAsync(ListingController.renderEditForm),
);

module.exports = router;
