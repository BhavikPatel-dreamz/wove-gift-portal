"use client"
import { Provider } from 'react-redux'
import store from '../../../redux/store'
import MyGift from '../../../components/client/giftflow/MyGift'
import Header from '../../../components/client/home/Header';
import Footer from "../../../components/client/home/Footer"

const page = () => {

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <MyGift />
        <Footer/>
      </div>
    </Provider>
  )
}

export default page