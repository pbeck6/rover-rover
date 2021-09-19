const Place = require('./models/place');
const Review = require('./models/review');
const { placeSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utilities/ExpressError');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in to continue');
        return res.redirect('/login');
    };
    next();
};

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const place = await Place.findById(id);
    if (!place.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission');
        return res.redirect(`/places/${id}`);
    };
    next();
};

module.exports.validatePlace = (req, res, next) => {
    const { error } = placeSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(element => element.message).join(', ')
        throw new ExpressError(msg, 400);
    } else {
        next();
    };
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(element => element.message).join(', ')
        throw new ExpressError(msg, 400);
    } else {
        next();
    };
};

module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission');
        return res.redirect(`/places/${id}`);
    };
    next();
};