"use client"
import { Provider } from 'react-redux'
import store from '../../../redux/store'
import Header from '../../../components/client/home/Header';
import Footer from "../../../components/client/home/Footer"
import PiaManual from '../../../components/pia-manual/PiaManual';

const page = () => {

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PiaManual/>
        <Footer/>
      </div>
    </Provider>
  )
}

export default page