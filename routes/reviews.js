const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utilities/catchAsync');
const reviews = require('../controllers/reviews');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');

router.get('/', catchAsync(reviews.index));

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
