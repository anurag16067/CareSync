import { createAuthClient } from './authClient'

// one session per role, each with its own refresh cookie (rt_admin, rt_doctor)
export const adminAuth = createAuthClient('admin')
export const adminApi = adminAuth.api

export const doctorAuth = createAuthClient('doctor')
export const doctorApi = doctorAuth.api
