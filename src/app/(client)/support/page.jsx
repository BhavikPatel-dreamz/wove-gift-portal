"use client"
import { Provider } from 'react-redux'
import store from '../../../redux/store'
import Header from '../../../components/client/home/Header';
import Footer from "../../../components/client/home/Footer"
import SupportForm from '../../../components/client/support/SupportForm';

const page = () => {

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <SupportForm/>
        <Footer/>
      </div>
    </Provider>
  )
}

export default page