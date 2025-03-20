import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        {/*-----Left Section -----  */}
        <div>
          <img className='mb-5 w-40' src={assets.logopic} alt="" />
          <p className='w-full md:w-2/3 text-gray-600 leading-6'>Our platform is dedicated to simplifying the process of scheduling doctor appointments. Whether you're looking for specialists or general practitioners, we connect patients with trusted healthcare providers in just a few clicks. Your health is our priority, and we aim to make accessing quality care easier than ever.</p>
        </div>

        {/*-----Center Section -----  */}
        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>Home</li>
            <li>About us</li>
            <li>Contact us</li>
            <li>Privacy policy</li>
            </ul>
        </div>

        {/*-----Right Section -----  */}
        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>+91-7484800270</li>
            <li>anuragkumar16067@gmail.com</li>
          </ul>
        </div>

      </div>

      {/*-----Copyright Text -----  */}
      <div>
        <hr />
        <p className='py-5 text-sm text-center'>Copyright © 2025 Anurag - All Right Reserved.</p> 
      </div>
    </div>
  )
}

export default Footer
