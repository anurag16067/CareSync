import authenticate from './authenticate.js'

// admin routes: verify a short-lived access token with role 'admin'
const authAdmin = authenticate('admin')

export default authAdmin;
