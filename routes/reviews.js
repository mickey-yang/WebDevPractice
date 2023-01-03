const express = require('express')
const router = express.Router({ mergeParams: true })

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

const Campground = require('../models/campgrounds')
const Review = require('../models/reviews')

const reviews = require('../controllers/reviews')

const { reviewSchema } = require('../schemas')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

// routes

router.post('', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewID', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewID } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewID } })
    await Review.findByIdAndDelete(reviewID)
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router
