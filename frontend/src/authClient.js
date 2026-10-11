import axios from 'axios'

// Empty in production: the app calls /api on its own domain and Vercel forwards it to the backend
export const baseURL = import.meta.env.VITE_BACKEND_URL || ''

// One client per role. The access token lives only in memory; the refresh token is an
// httpOnly cookie the browser sends to /api/auth automatically.
export const createAuthClient = (role) => {
    let accessToken = null
    let listener = () => {}
    let refreshing = null

    const setToken = (token) => {
        accessToken = token || null
        listener(accessToken)
    }

    const api = axios.create({ baseURL, withCredentials: true })

    // one refresh at a time: parallel 401s all wait for the same request
    const refresh = () => {
        if (!refreshing) {
            refreshing = axios.post(`${baseURL}/api/auth/${role}/refresh`, {}, { withCredentials: true })
                .then(({ data }) => (data.success ? data.token : null))
                .catch(() => null)
                .then((token) => { setToken(token); return token })
                .finally(() => { refreshing = null })
        }
        return refreshing
    }

    api.interceptors.request.use((config) => {
        if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
        return config
    })

    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const { config, response } = error
            if (response?.status === 401 && config && !config._retry) {
                config._retry = true
                if (response.data?.code === 'TOKEN_EXPIRED' && (await refresh())) {
                    return api(config)   // retry with the new access token
                }
                setToken(null)           // session is over: show logged-out UI
            }
            return Promise.reject(error)
        }
    )

    const logout = async () => {
        try {
            await axios.post(`${baseURL}/api/auth/${role}/logout`, {}, { withCredentials: true })
        } catch (error) {
            console.log(error)
        }
        setToken(null)
    }

    return {
        api,
        refresh,
        logout,
        setToken,
        onTokenChange: (fn) => { listener = fn },
    }
}
