import mongoose from 'mongoose';

// One row per issued refresh token. Only the SHA-256 hash is stored, never the token itself.
const refreshTokenSchema = new mongoose.Schema({
    tokenHash: { type: String, required: true, unique: true },
    subject: { type: String, required: true },          // userId, docId, or 'admin'
    role: { type: String, enum: ['user', 'doctor', 'admin'], required: true },
    family: { type: String, required: true },           // all tokens rotated from one login
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    // rotated = replaced by a newer token (short grace allowed); logout / compromised = dead immediately
    revokedReason: { type: String, enum: ['rotated', 'logout', 'compromised', null], default: null },
    replacedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    userAgent: { type: String, default: '' },
}, { timestamps: { createdAt: true, updatedAt: false } })

// MongoDB deletes rows automatically once they expire
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
refreshTokenSchema.index({ subject: 1, role: 1 })
refreshTokenSchema.index({ family: 1 })

const refreshTokenModel = mongoose.models.refreshToken || mongoose.model('refreshToken', refreshTokenSchema);

export default refreshTokenModel;
