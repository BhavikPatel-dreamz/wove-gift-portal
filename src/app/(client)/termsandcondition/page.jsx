"use client"
import React from 'react'
import { Provider } from 'react-redux'
import Header from '../../../components/client/home/Header'
import store from '../../../redux/store'
import WorkMain from '../../../components/work/WorkMain'
import Footer from "../../../components/client/home/Footer"
import TermsMain from '../../../components/termsandcondition/TermsMain'

const page = () => {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <TermsMain />
        <Footer/>
      </div>
    </Provider>
  )
}

export default page
