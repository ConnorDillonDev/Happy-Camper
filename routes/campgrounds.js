const express = require('express');
const router = express.Router();
const campground = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
const multer  = require('multer')
const {storage} = require('../cloudinary/index')
const upload = multer({storage})



router.route('/')
    .get(catchAsync(campground.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campground.createCampground))


router.get('/new', isLoggedIn, campground.newForm)

router.route('/:id')
    .get(catchAsync(campground.showCampground))
    .put(isLoggedIn, isAuthor,upload.array('image'), validateCampground, catchAsync(campground.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campground.destroyCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campground.editForm))

module.exports = router;