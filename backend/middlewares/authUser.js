import authenticate from './authenticate.js'

// user routes: verify a short-lived access token with role 'user'
const authUser = authenticate('user')

export default authUser;
