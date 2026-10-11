import React from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext' 
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'

const Navbar = () => {

  const {aToken, adminLogout} = useContext(AdminContext)
  const {dToken, doctorLogout} = useContext(DoctorContext)

  const navigate = useNavigate()

  // revokes the refresh token on the server, not just in this browser
  const logout = async () => {
    navigate('/')
    if (aToken) await adminLogout()
    if (dToken) await doctorLogout()
  }

    
  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-2 text-xs'>
        <img className='w-36 sm:w-40 cursor-pointer' src={assets.adminLogo} alt="" />
        <p className='border px-2.5 rounded-full border-gray-500 text-gray-600'>{aToken ? 'Admin' : 'Doctor'}</p>
      </div>
      <button onClick={logout} className='bg-blue-500 text-white text-sm px-10 py-2 rounded-full hover:cursor-pointer'>Logout</button>
    </div>
  )
}

export default Navbar