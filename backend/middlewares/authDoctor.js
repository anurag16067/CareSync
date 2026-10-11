import authenticate from './authenticate.js'

// doctor routes: verify a short-lived access token with role 'doctor'
const authDoctor = authenticate('doctor')

export default authDoctor;
