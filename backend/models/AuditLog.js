const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            required: true,
            trim: true,
        },
        targetType: {
            type: String,
            trim: true,
            default: '',
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        ip: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);