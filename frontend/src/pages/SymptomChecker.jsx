import React, { useContext, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { api } from '../api'

const durations = ['Less than a day', '1-3 days', 'About a week', 'More than a week']
const quickChips = ['Fever', 'Headache', 'Skin rash', 'Stomach pain', 'Child is sick']

const urgencyStyle = {
  low: { label: '🟢 Low', className: 'bg-green-100 text-green-700' },
  moderate: { label: '🟡 Moderate', className: 'bg-yellow-100 text-yellow-700' },
  high: { label: '🔴 High', className: 'bg-red-100 text-red-700' },
}

const SymptomChecker = () => {

  const navigate = useNavigate()
  const location = useLocation()
  const { token, backendUrl, doctors } = useContext(AppContext)

  const [symptoms, setSymptoms] = useState(location.state?.symptoms || '')
  const [duration, setDuration] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const addChip = (chip) => {
    setSymptoms(prev => prev ? `${prev}, ${chip.toLowerCase()}` : chip)
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (symptoms.trim().length < 10) {
      return toast.warn('Please describe your symptoms in a bit more detail')
    }
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/api/user/ai/symptom-check', { symptoms, duration })
      if (data.success) {
        setResult(data.result)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
    setLoading(false)
  }

  // available doctors first
  const matchedDoctors = result
    ? doctors.filter(doc => doc.speciality === result.speciality).sort((a, b) => b.availability - a.availability)
    : []

  return (
    <div className='max-w-4xl mx-auto'>
      <p className='text-2xl font-medium text-gray-800'>AI Symptom Checker</p>
      <p className='text-sm text-gray-500 mt-1'>Describe what you're feeling and we'll suggest the right specialist. This is guidance, not a diagnosis.</p>

      {/*------- Symptom Form ------- */}
      <form onSubmit={onSubmitHandler} className='mt-6 border border-gray-300 rounded-lg p-6 flex flex-col gap-4 text-sm text-gray-600'>
        <div>
          <p className='mb-1 font-medium text-gray-700'>Your symptoms</p>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            disabled={!token}
            maxLength={500}
            rows={4}
            className='w-full border border-gray-300 rounded p-3 outline-primary disabled:bg-gray-100'
            placeholder='e.g. I have had a headache and mild fever since yesterday, and feel tired'
          />
          <p className='text-xs text-right text-gray-400'>{symptoms.length}/500</p>
        </div>

        <div className='flex flex-wrap gap-2'>
          {quickChips.map((chip, index) => (
            <button type='button' disabled={!token} onClick={() => addChip(chip)} key={index} className='px-3 py-1 border border-gray-300 rounded-full hover:bg-indigo-50 disabled:opacity-50'>
              + {chip}
            </button>
          ))}
        </div>

        <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
          <p className='font-medium text-gray-700'>How long?</p>
          <select disabled={!token} value={duration} onChange={(e) => setDuration(e.target.value)} className='border border-gray-300 rounded px-3 py-2 sm:w-56'>
            <option value=''>Select duration</option>
            {durations.map((item, index) => <option key={index} value={item}>{item}</option>)}
          </select>
        </div>

        {
          token
            ? <button type='submit' disabled={loading} className='self-start bg-primary text-white px-10 py-3 rounded-full disabled:opacity-60'>
              {loading ? 'Analyzing...' : 'Analyze symptoms'}
            </button>
            : <button type='button' onClick={() => navigate('/login')} className='self-start bg-primary text-white px-10 py-3 rounded-full'>
              Login to use AI checker
            </button>
        }
      </form>

      {/*------- Result ------- */}
      {result && result.emergency && (
        <div className='mt-6 border border-red-300 bg-red-50 rounded-lg p-6'>
          <p className='text-lg font-semibold text-red-700'>🚨 Seek emergency care now</p>
          <p className='text-sm text-red-700 mt-1'>Your symptoms may need urgent attention. Please call <b>112</b> or go to the nearest emergency room instead of booking an appointment.</p>
          {result.reason && <p className='text-sm text-gray-600 mt-3'>{result.reason}</p>}
        </div>
      )}

      {result && !result.emergency && (
        <>
          <div className='mt-6 border border-indigo-200 bg-indigo-50 rounded-lg p-6 text-sm text-gray-700'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <p className='text-lg text-gray-800'>Recommended: <span className='font-semibold text-primary'>{result.speciality}</span></p>
              <p className={`px-3 py-1 rounded-full text-xs font-medium ${urgencyStyle[result.urgency].className}`}>Urgency: {urgencyStyle[result.urgency].label}</p>
            </div>
            <p className='mt-3'><span className='font-medium'>Why:</span> {result.reason}</p>
            {result.alternative && (
              <p className='mt-2'>
                <span className='font-medium'>Also consider:</span>{' '}
                <span onClick={() => navigate(`/doctors/${result.alternative}`)} className='text-primary underline cursor-pointer'>{result.alternative}</span>
              </p>
            )}
            {result.tips.length > 0 && (
              <div className='mt-3'>
                <p className='font-medium'>Tips while you wait:</p>
                <ul className='list-disc ml-5 mt-1'>
                  {result.tips.map((tip, index) => <li key={index}>{tip}</li>)}
                </ul>
              </div>
            )}
            <p className='mt-4 text-xs text-gray-500'>⚠ This is not a medical diagnosis. If symptoms get worse, call 112.</p>
          </div>

          {/*------- Matching Doctors ------- */}
          <div className='mt-8'>
            <p className='text-lg font-medium text-gray-800'>{result.speciality} doctors</p>
            {matchedDoctors.length === 0
              ? <p className='text-sm text-gray-500 mt-2'>No {result.speciality} doctors are listed right now.</p>
              : <div className='w-full grid grid-cols-auto gap-4 gap-y-6 mt-4'>
                {matchedDoctors.slice(0, 4).map((item, index) => (
                  <div onClick={() => { navigate(`/appointment/${item._id}`, { state: { symptoms } }); scrollTo(0, 0) }} className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
                    <img className='bg-blue-50' src={item.image} alt="" />
                    <div className='p-4'>
                      <div className={`flex items-center gap-2 text-sm text-center ${item.availability ? 'text-green-500' : 'text-gray-500'}`}>
                        <p className={`w-2 h-2 ${item.availability ? 'bg-green-500' : 'bg-gray-500'}  rounded-full`}></p><p>{item.availability ? 'Available' : 'Not Available'}</p>
                      </div>
                      <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                      <p className='text-gray-600 text-sm'>{item.speciality}</p>
                    </div>
                  </div>
                ))}
              </div>
            }
            <button onClick={() => { navigate(`/doctors/${result.speciality}`); scrollTo(0, 0) }} className='mt-6 bg-blue-50 text-gray-600 px-10 py-3 rounded-full'>
              See all {result.speciality} doctors →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default SymptomChecker
