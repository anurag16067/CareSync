import { createContext, useEffect, useState } from "react";
import { doctorApi, doctorAuth } from '../api'
import {toast} from "react-toastify";


export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    // access token only in memory; restored from the rt_doctor refresh cookie on reload
    const [dToken, setDTokenState] = useState('');
    const setDToken = (token) => doctorAuth.setToken(token);
    const doctorLogout = () => doctorAuth.logout();

    useEffect(() => {
        doctorAuth.onTokenChange((token) => setDTokenState(token || ''))
        localStorage.removeItem('dToken') // old non-expiring tokens are no longer used
        doctorAuth.refresh()
    }, [])
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);
    const [profileData, setProfileData] = useState(false);

    const getAppointments = async () => {
        try {
            const {data} = await doctorApi.get('/api/doctor/appointments')
            if(data.success) {
                setAppointments(data.appointments)
                console.log(data.appointments)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            
        }
    }

    const completeAppointment = async (appointmentId) => {
        try {
            const {data} = await doctorApi.post('/api/doctor/complete-appointment', {appointmentId})
            if(data.success) {
                toast.success(data.message)
                getAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const {data} = await doctorApi.post('/api/doctor/cancel-appointment', {appointmentId})
            if(data.success) {
                toast.success(data.message)
                getAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }
    const getDashData = async () => {
        try {
            const {data} = await doctorApi.get('/api/doctor/dashboard')
            if(data.success) {
                setDashData(data.dashData)
                console.log(data.dashData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            
        }
    }

    const getProfileData = async () => {
        try {
            const {data} = await doctorApi.get('/api/doctor/profile')
            if(data.success) {
                setProfileData(data.profileData)
                console.log(data.profileData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            
        }
    }


    const value = {
        dToken,
        setDToken,
        doctorLogout,
        backendUrl,
        appointments,
        setAppointments,
        getAppointments,
        completeAppointment,
        cancelAppointment,
        dashData,
        setDashData,
        getDashData,
        getProfileData,
        profileData,
        setProfileData
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider;