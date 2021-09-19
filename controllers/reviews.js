const Place = require('../models/place');
const Review = require('../models/review');

module.exports.index = async (req, res) => {
    const place = await Place.findById(req.params.id);
    res.redirect(`/places/${place._id}`);
};

module.exports.createReview = async (req, res) => {
    const place = await Place.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    place.reviews.push(review);
    await review.save();
    await place.save();
    req.flash('success', 'Successfully added review');
    res.redirect(`/places/${place._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Place.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/places/${id}`);
};