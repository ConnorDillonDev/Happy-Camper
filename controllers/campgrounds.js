const Camp = require('../models/camp')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({
    accessToken: mapBoxToken
})
const {
    cloudinary
} = require("../cloudinary")


module.exports.index = async (req, res) => {
    const campgrounds = await Camp.find({})
    res.render('campgrounds/index', {
        campgrounds
    }) //pass campgrounds results to the ejs template
}

module.exports.newForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    console.log(req.body.campground)
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const camp = new Camp(req.body.campground) //parse from form input
    camp.geometry = geoData.body.features[0].geometry;
    console.log(camp)
    camp.images = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }))
    camp.author = req.user._id;
    console.log(camp)
    await camp.save() //save to db
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${camp._id}`)
}

module.exports.updateCampground = async (req, res) => {
    const {
        id
    } = req.params;
    const camp = await Camp.findByIdAndUpdate(id, {
        ...req.body.campground
    }); //routerly all new data sent from forum //... spread
    const imgs = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }))
    camp.images.push(...imgs)
    await camp.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await camp.updateOne({
            $pull: {
                images: {
                    filename: {
                        $in: req.body.deleteImages
                    }
                }
            }
        })
    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${camp._id}`)

}

module.exports.editForm = async (req, res) => {
    const camp = await Camp.findById(req.params.id)
    console.log(camp);
    if (!camp) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }

    res.render('campgrounds/edit', {
        camp
    });
}

module.exports.showCampground = async (req, res) => {
    const campground = await Camp.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {
        campground
    })
    console.log(req.params)
}

module.exports.destroyCampground = async (req, res) => {
    const {
        id
    } = req.params;
    await Camp.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}