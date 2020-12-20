const express = require('express')
const router = express.Router({mergeParams:true});
const {validateReview, isLoggedIn, isReviewAuthor} =require('../middleware')
const catchAsync = require('../utils/catchAsync')


const review = require('../controllers/reviews')
const Review = require('../models/review')
const Camp = require('../models/camp')


//post review
router.post('/', validateReview, isLoggedIn, catchAsync(review.createReview))

//delete reviews route
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(review.deleteReview))

module.exports = router;