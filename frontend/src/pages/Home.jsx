import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import SymptomTeaser from '../components/SymptomTeaser'

const Home = () => {
  return (
    <div>
      <Header/>
      <SymptomTeaser/>
      <SpecialityMenu/>
      <TopDoctors/>
      <Banner/>
    </div>
  )
}

export default Home
