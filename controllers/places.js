const Place = require('../models/place');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mbxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mbxToken});

module.exports.index = async (req, res) => {
    const places = await Place.find({});
    res.render('places/index', { places });
};

module.exports.renderNewForm = (req, res) => {
    res.render('places/new');
};

module.exports.createPlace = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.place.address,
        limit: 1
    }).send();
    const place = new Place(req.body.place);
    place.geometry = geoData.body.features[0].geometry;
    place.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    place.author = req.user._id;
    await place.save();
    req.flash('success', 'Successfully added new place');
    res.redirect(`/places/${place._id}`);
};

module.exports.showPlace = async (req, res) => {
    const place = await (await Place.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    })).populate('author');
    if (!place) {
        req.flash('error', 'Cannot find that place');
        return res.redirect('/places');
    };
    res.render('places/show', { place });
};

module.exports.renderEditForm = async (req, res) => {
    const place = await Place.findById(req.params.id);
    if (!place) {
        req.flash('error', 'Cannot find that place');
        return res.redirect('/places');
    };
    res.render('places/edit', { place });
};

module.exports.updatePlace = async (req, res) => {
    const { id } = req.params;
    const place = await Place.findByIdAndUpdate(id, {...req.body.place});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    place.images.push(...imgs);
    await place.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await place.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    };
    req.flash('success', 'Successfully updated');
    res.redirect(`/places/${id}`);
};

module.exports.deletePlace = async (req, res) => {
    const { id } = req.params;
    const { images } = await Place.findById(id);
    for (let image of images) {
        await cloudinary.uploader.destroy(image.filename);
    }
    await Place.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted');
    res.redirect('/places');
};
