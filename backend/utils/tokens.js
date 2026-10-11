import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import refreshTokenModel from '../models/refreshTokenModel.js';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';

export const ROLES = ['user', 'doctor', 'admin'];

const REFRESH_DAYS = Number(process.env.REFRESH_TOKEN_DAYS) || 7;
// two tabs refreshing at the same moment both send the same cookie; don't treat that as theft
const REUSE_GRACE_MS = 10 * 1000;

const accessSecret = () => process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const hash = (token) => crypto.createHash('sha256').update(token).digest('hex');
const cookieName = (role) => `rt_${role}`;

const cookieOptions = (req) => ({
    httpOnly: true,
    secure: req.secure,           // true behind HTTPS (Render/Vercel), false on http://localhost
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: REFRESH_DAYS * 24 * 60 * 60 * 1000,
});

export const signAccessToken = (subject, role) =>
    jwt.sign({ sub: subject, role }, accessSecret(), { expiresIn: process.env.ACCESS_TOKEN_TTL || '15m' });

export const verifyAccessToken = (token) => jwt.verify(token, accessSecret());

const issueRefreshToken = async (req, res, { subject, role, family }) => {
    const token = crypto.randomBytes(64).toString('base64url');
    const row = await refreshTokenModel.create({
        tokenHash: hash(token),
        subject,
        role,
        family,
        expiresAt: new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000),
        userAgent: (req.headers['user-agent'] || '').slice(0, 200),
    });
    res.cookie(cookieName(role), token, cookieOptions(req));
    return row;
}

// Called after a successful login: starts a new token family, returns the access token
export const startSession = async (req, res, subject, role) => {
    await issueRefreshToken(req, res, { subject: String(subject), role, family: crypto.randomUUID() });
    return signAccessToken(String(subject), role);
}

const accountExists = async (subject, role) => {
    if (role === 'admin') return subject === 'admin';
    const model = role === 'user' ? userModel : doctorModel;
    return Boolean(await model.exists({ _id: subject }));
}

// end every session from one login, including tokens still inside the rotation grace window
export const revokeFamily = async (family) => {
    await refreshTokenModel.updateMany({ family, revokedAt: null }, { revokedAt: new Date() });
    await refreshTokenModel.updateMany({ family }, { revokedReason: 'compromised' });
}

// Rotate the refresh token from the cookie. Returns a new access token, or null if the session is invalid.
export const rotateSession = async (req, res, role) => {
    const raw = req.cookies?.[cookieName(role)];
    if (!raw) return null;

    const row = await refreshTokenModel.findOne({ tokenHash: hash(raw), role });
    if (!row || row.expiresAt < new Date()) return null;

    if (row.revokedAt) {
        // a token that was already rotated is being used again
        const inGrace = row.revokedReason === 'rotated' && Date.now() - row.revokedAt.getTime() <= REUSE_GRACE_MS;
        if (row.revokedReason !== 'rotated') return null;   // logged out or already compromised
        if (!inGrace) {
            await revokeFamily(row.family);   // likely stolen: end every session from that login
            return null;
        }
    } else {
        // revoke atomically so two parallel refreshes can't both rotate the same token
        const claimed = await refreshTokenModel.findOneAndUpdate(
            { _id: row._id, revokedAt: null },
            { revokedAt: new Date(), revokedReason: 'rotated' }
        );
        if (!claimed) return rotateSession(req, res, role);
    }

    if (!(await accountExists(row.subject, row.role))) {
        await revokeFamily(row.family);
        return null;
    }

    const next = await issueRefreshToken(req, res, { subject: row.subject, role, family: row.family });
    if (!row.replacedBy) await refreshTokenModel.updateOne({ _id: row._id }, { replacedBy: next._id });
    return signAccessToken(row.subject, role);
}

// Revoke the current refresh token (or all of this account's tokens) and clear the cookie
export const endSession = async (req, res, role, { everywhere = false } = {}) => {
    const raw = req.cookies?.[cookieName(role)];
    if (raw) {
        const row = await refreshTokenModel.findOneAndUpdate(
            { tokenHash: hash(raw), role, revokedAt: null },
            { revokedAt: new Date(), revokedReason: 'logout' }
        );
        if (row && everywhere) {
            await refreshTokenModel.updateMany({ subject: row.subject, role, revokedAt: null }, { revokedAt: new Date(), revokedReason: 'logout' });
        }
    }
    const { maxAge, ...clearOptions } = cookieOptions(req);
    res.clearCookie(cookieName(role), clearOptions);
}
