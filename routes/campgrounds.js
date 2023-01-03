const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

const campgrounds = require('../controllers/campgrounds')
const Campground = require('../models/campgrounds')
const { campgroundSchema } = require('../schemas')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))



router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

// Edit campgrounds
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEdit))

module.exports = router
