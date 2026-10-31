const mongoose = require('mongoose');

const clientProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        companyName: {
            type: String,
            trim: true,
            default: '',
        },
        companyDescription: {
            type: String,
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
            default: '',
        },
        website: {
            type: String,
            trim: true,
            default: '',
        },
        industry: {
            type: String,
            trim: true,
            default: '',
        },
        location: {
            type: String,
            trim: true,
            default: '',
        },
        contactPhone: {
            type: String,
            trim: true,
            default: '',
        },
        savedStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        ratingCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('ClientProfile', clientProfileSchema);