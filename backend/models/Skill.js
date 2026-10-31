const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Skill name is required'],
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            trim: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            default: null,
        },
        visible: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Skill', skillSchema);