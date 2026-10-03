import { rateLimit, ipKeyGenerator } from 'express-rate-limit'

// limit AI requests per user to protect the free API quota (runs after authUser)
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    keyGenerator: (req) => req.body.userId || ipKeyGenerator(req.ip),
    handler: (req, res) => {
        res.json({ success: false, message: "Too many AI requests, please try again in a few minutes" })
    }
})

export default aiLimiter;
