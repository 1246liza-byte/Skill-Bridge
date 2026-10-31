const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Banner title is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        image: {
            type: String,
            default: '',
        },
        link: {
            type: String,
            trim: true,
            default: '',
        },
        order: {
            type: Number,
            default: 0,
        },
        published: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Banner', bannerSchema);