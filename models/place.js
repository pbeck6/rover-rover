const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const opts = { toJSON: { virtuals: true } };

const imageSchema = new Schema({
    url: String,
    filename: String
});

imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

const placeSchema = new Schema({
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    address: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
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
    }
}, opts);

placeSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href='/places/${this._id}'>${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}</p>`;
});

placeSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});

module.exports = mongoose.model('Place', placeSchema);