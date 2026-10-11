import { ROLES, rotateSession, endSession } from '../utils/tokens.js';

const validRole = (req, res) => {
    if (ROLES.includes(req.params.role)) return req.params.role;
    res.status(404).json({ success: false, message: 'Unknown role' });
    return null;
}

// API to get a new access token using the refresh token cookie (rotates the refresh token)
const refresh = async (req, res) => {
    try {
        const role = validRole(req, res);
        if (!role) return;
        const token = await rotateSession(req, res, role);
        if (!token) {
            await endSession(req, res, role);
            return res.status(401).json({ success: false, code: 'SESSION_ENDED', message: 'Please login again' });
        }
        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to log out: revokes the refresh token on the server and clears the cookie
const logout = async (req, res) => {
    try {
        const role = validRole(req, res);
        if (!role) return;
        await endSession(req, res, role);
        res.json({ success: true, message: 'Logged out' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to log out of every device for this account
const logoutAll = async (req, res) => {
    try {
        const role = validRole(req, res);
        if (!role) return;
        await endSession(req, res, role, { everywhere: true });
        res.json({ success: true, message: 'Logged out of all devices' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export { refresh, logout, logoutAll };
