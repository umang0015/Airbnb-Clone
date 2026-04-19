const joi = require('joi');

module.exports.listingSchema = joi.object({
  listing: joi
    .object({
      title: joi.string().required(),
      description: joi.string().required(),
      location: joi.string().required(),
      country: joi.string().required(),
      price: joi.number().required(),
      image: joi
        .object({
          url: joi.string().uri().allow('', null),
          filename: joi.string().allow('', null),
        })
        .optional(),
    })
    .required(),
});

module.exports.reviewSchema = joi.object({
  rating: joi.number().required().min(1).max(5),
  comment: joi.string().required().min(10).max(500),
});
