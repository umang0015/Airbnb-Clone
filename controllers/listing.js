const Listing = require('../models/listing');
const { cloudinary } = require('../cloudConfig');

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render('listings/index.ejs', { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render('listings/new.ejs');
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'author',
      },
    })
    .populate('owner');
  if (!listing) {
    req.flash('error', 'Listing you requested for does not exist');
    return res.redirect('/listings');
  }
  res.render('listings/show.ejs', { listing });
};

module.exports.createListing = async (req, res) => {
  if (!req.file) {
    req.flash('error', 'Please upload an image');
    return res.redirect('/listings/new');
  }
  let url = req.file.path;
  let filename = req.file.filename;
  const listingData = req.body.listing;
  const newListing = new Listing(listingData);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash('success', 'New Listing Created!');
  res.redirect('/listings');
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash('error', 'Listing you requested for does not exist');
    return res.redirect('/listings');
  }
  let originalImageUrl = '';
  if (listing.image && listing.image.url) {
    originalImageUrl = listing.image.url.replace('/upload', '/upload/w_250');
  }
  res.render('listings/edit.ejs', { listing, originalImageUrl });
};

module.exports.UpdateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );
  if (req.file) {
    if (listing.image && listing.image.filename) {
      try {
        await cloudinary.uploader.destroy(listing.image.filename);
      } catch (err) {
        console.log('Cloudinary delete failed:', err);
      }
    }
    listing.image = { url: req.file.path, filename: req.file.filename };
    await listing.save();
  }
  req.flash('success', 'Listing Updated!');
  res.redirect(`/listings/${id}`);
};

module.exports.DestroyListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (listing && listing.image && listing.image.filename) {
    try {
      await cloudinary.uploader.destroy(listing.image.filename);
    } catch (err) {
      console.log('Cloudinary delete failed:', err);
    }
  }
  await Listing.findByIdAndDelete(id);
  req.flash('success', 'Listing deleted!');
  res.redirect('/listings');
};