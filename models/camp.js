const {
    string
} = require('joi');
const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema; //shortcut to reference schema/blueprints


const ImageSchema = new Schema({
    url: String,
    filename: String
})

const schemaOptions = {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
};

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]

}, schemaOptions);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.sub(0.25)}...</p>`
})

//middleware query
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews //remove the review in the doc array that was deleted and passed as doc
            }
        })
    }
})


module.exports = mongoose.model('Campground', CampgroundSchema);