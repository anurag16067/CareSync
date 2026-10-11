import { verifyAccessToken } from '../utils/tokens.js';

// Verifies the short-lived access token sent as "Authorization: Bearer <token>" and checks its role.
// Keeps the old contract: user routes get req.body.userId, doctor routes get req.body.docId.
const authenticate = (role) => (req, res, next) => {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Not authorized Login again' });
    }

    let payload;
    try {
        payload = verifyAccessToken(token);
    } catch (error) {
        const expired = error.name === 'TokenExpiredError';
        return res.status(401).json({
            success: false,
            code: expired ? 'TOKEN_EXPIRED' : 'UNAUTHORIZED',
            message: expired ? 'Session expired' : 'Not authorized Login again',
        });
    }

    if (payload.role !== role) {
        return res.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Not authorized Login again' });
    }

    req.body = req.body || {};
    if (role === 'user') req.body.userId = payload.sub;
    if (role === 'doctor') req.body.docId = payload.sub;
    req.auth = payload;
    next();
}

export default authenticate;
