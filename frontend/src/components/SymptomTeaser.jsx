import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SymptomTeaser = () => {

  const navigate = useNavigate()
  const [symptoms, setSymptoms] = useState('')

  const onSubmitHandler = (e) => {
    e.preventDefault()
    navigate('/symptom-checker', { state: { symptoms } })
    scrollTo(0, 0)
  }

  return (
    <div className='mt-10 border border-indigo-200 bg-indigo-50 rounded-lg px-6 py-8 md:px-10'>
      <p className='text-xl md:text-2xl font-medium text-gray-800'>🤖 Not sure which doctor to see?</p>
      <p className='text-sm text-gray-600 mt-1'>Describe your symptoms and our AI will suggest the right specialist.</p>
      <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row gap-3 mt-5'>
        <input
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className='flex-1 border border-gray-300 rounded-full px-5 py-3 text-sm outline-primary bg-white'
          type="text"
          maxLength={500}
          placeholder='e.g. itchy red rash on my arms for 3 days'
        />
        <button type='submit' className='bg-primary text-white text-sm px-8 py-3 rounded-full hover:scale-105 transition-all duration-300'>Check →</button>
      </form>
    </div>
  )
}

export default SymptomTeaser
