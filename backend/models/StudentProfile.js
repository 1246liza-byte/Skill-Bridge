const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        headline: {
            type: String,
            trim: true,
            maxlength: [150, 'Headline cannot exceed 150 characters'],
            default: '',
        },
        bio: {
            type: String,
            trim: true,
            maxlength: [2000, 'Bio cannot exceed 2000 characters'],
            default: '',
        },
        skills: [
            {
                name: { type: String, trim: true },
                proficiency: {
                    type: String,
                    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
                    default: 'Intermediate',
                },
            },
        ],
        education: [
            {
                institution: { type: String, trim: true },
                degree: { type: String, trim: true },
                fieldOfStudy: { type: String, trim: true },
                startYear: Number,
                endYear: Number,
            },
        ],
        experience: [
            {
                title: { type: String, trim: true },
                company: { type: String, trim: true },
                description: { type: String, trim: true },
                startDate: Date,
                endDate: Date,
                current: { type: Boolean, default: false },
            },
        ],
        certifications: [
            {
                name: { type: String, trim: true },
                issuer: { type: String, trim: true },
                year: Number,
                credentialUrl: { type: String, trim: true },
            },
        ],
        portfolio: [
            {
                title: { type: String, trim: true },
                description: { type: String, trim: true },
                image: { type: String, default: '' },
                link: { type: String, trim: true },
                category: { type: String, trim: true },
            },
        ],
        availability: {
            type: String,
            enum: ['available', 'busy', 'unavailable'],
            default: 'available',
        },
        preferredCategories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Category',
            },
        ],
        hourlyRate: {
            type: Number,
            min: 0,
            default: 0,
        },
        projectRate: {
            type: Number,
            min: 0,
            default: 0,
        },
        location: {
            type: String,
            trim: true,
            default: '',
        },
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
        completedProjects: {
            type: Number,
            default: 0,
        },
        profileCompletion: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);