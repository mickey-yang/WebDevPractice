const { campgroundSchema, reviewSchema } = require('./schemas')
const Campground = require('./models/campgrounds')
const Review = require('./models/reviews')
const ExpressError = require('./utils/ExpressError')



const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in to view this page')
        return res.redirect('/login')
    }
    next()
}

module.exports.isLoggedIn = isLoggedIn

// Check campground middleware
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    console.log(error)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
} 

// Check author middleware
module.exports.isAuthor = async (req, res, next)=> {
    const { id } = req.params
    const campground = await Campground.findById(id) 
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have prermissions to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

// Check Review author middleware
module.exports.isReviewAuthor = async (req, res, next)=> {
    const { id, reviewID } = req.params
    console.log(reviewID)
    const review = await Review.findById(reviewID) 
    console.log("REVIEW LOADED - START CHECK")
    console.log(review)
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have prermissions to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

// Reviews middlewares 

module.exports.validateReview = (req, res, next) =>{
    const {error} = reviewSchema.validate(req.body)
    console.log(error)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}
