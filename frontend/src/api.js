import { createAuthClient } from './authClient'

// patient session: access token in memory, refresh token in the rt_user cookie
export const userAuth = createAuthClient('user')
export const api = userAuth.api
