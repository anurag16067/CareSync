import { createContext, useEffect, useState } from 'react';
// import { doctors } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AppContext = createContext();

const AppContextProvider = (props) => {

    const currencySymbol = '$';
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [doctors, setDoctors] = useState([]);
    //to store user authenticaion token
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : false);
    const [userData, setUserData] = useState()

    

    const getDoctorsData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/doctor/list')
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
            const {data} = await axios.get(backendUrl + '/api/user/get-profile', {headers:{token}})
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
        backendUrl,
        userData,
        setUserData,
        getDoctorsData,
        loadUserProfileData
    }

    useEffect(() => {
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