import { createContext, useEffect, useState } from 'react';
// import { doctors } from '../assets/assets';
import { api, userAuth } from '../api';
import { toast } from 'react-toastify';

export const AppContext = createContext();

const AppContextProvider = (props) => {

    const currencySymbol = '$';
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [doctors, setDoctors] = useState([]);
    //to store user authenticaion token
    // access token is kept only in memory; a page reload restores it from the refresh cookie
    const [token, setTokenState] = useState(false);
    const setToken = (newToken) => userAuth.setToken(newToken);
    const logout = () => userAuth.logout();
    const [userData, setUserData] = useState()

    

    const getDoctorsData = async () => {
        try {
            const {data} = await api.get('/api/doctor/list')
            console.log(data)
            if(data.success){
                setDoctors(data.doctors)
            } else {
                toast.error(data.message
                )
            }
        } catch (error) {
            console.log(error)  
            toast.error(error.message)
    }
    }

    const loadUserProfileData = async () => {
        try {
            const {data} = await api.get('/api/user/get-profile')
            if(data.success){
                setUserData(data.userData)
            }
            else {
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)  
            toast.error(error.message)
        }
    }

    const value = {
        doctors, 
        currencySymbol,
        token,
        setToken,
        logout,
        backendUrl,
        userData,
        setUserData,
        getDoctorsData,
        loadUserProfileData
    }

    useEffect(() => {
        userAuth.onTokenChange((newToken) => setTokenState(newToken || false))
        localStorage.removeItem('token') // old non-expiring tokens are no longer used
        userAuth.refresh() // silent login if the refresh cookie is still valid
        getDoctorsData()
    },[])
    useEffect(() => {
        if(token){
            loadUserProfileData()
        }
        else {
            setUserData(null)
        }
    }, [token])

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;