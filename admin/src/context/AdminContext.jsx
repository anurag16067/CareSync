import { createContext, useEffect, useState } from "react";
import { adminApi, adminAuth } from '../api'
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {

    // access token only in memory; restored from the rt_admin refresh cookie on reload
    const [aToken, setATokenState] = useState('');
    const setAToken = (token) => adminAuth.setToken(token);
    const adminLogout = () => adminAuth.logout();

    useEffect(() => {
        adminAuth.onTokenChange((token) => setATokenState(token || ''))
        localStorage.removeItem('aToken') // old non-expiring tokens are no longer used
        adminAuth.refresh()
    }, [])

    const [doctors, setDoctors] = useState([])
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const getAllDoctors = async () => {
        try {

            const { data } = await adminApi.post('/api/admin/all-doctors', 
                    {}
                  );


            if(data.success){
                setDoctors(data.doctors)
                console.log(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            
        }
    }

    const changeAvailability = async (docId) => {
        try {
            const { data } = await adminApi.post('/api/admin/change-availability', 
                {docId}
              );
              if(data.success){
                  toast.success(data.message)
                  getAllDoctors()
              } else {
                    toast.error(data.message)
              }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getAllAppointments = async () => {
        try {
            const { data } = await adminApi.get('/api/admin/appointments'
              )
            if(data.success){
                setAppointments(data.appointments)
                console.log(data.appointments)
            } else {
                toast.error(data.message)
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }
    const cancelAppointment = async (appointmentId) =>{
        try {
            const {data} = await adminApi.post('/api/admin/cancel-appointment', {appointmentId})
            if(data.success){
                toast.success(data.message)
                getAllAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getDashData = async () => {
        try {
            const {data} = await adminApi.get('/api/admin/dashboard')
            if(data.success){
                setDashData(data.dashData)
                console.log(data.dashData)
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const value = {
        aToken, 
        setAToken,
        adminLogout,
        backendUrl,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments, setAppointments,
        getAllAppointments,
        cancelAppointment,
        dashData,
        getDashData

    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider;