const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);