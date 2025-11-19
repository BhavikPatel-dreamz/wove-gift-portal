"use client"
import { Provider } from 'react-redux'
import store from '../../../redux/store'
import Header from '../../../components/client/home/Header';
import ReviewsMain from '../../../components/client/reviews/ReviewsMain';
import Footer from "../../../components/client/home/Footer"

const page = () => {

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <ReviewsMain/>
        <Footer/>
      </div>
    </Provider>
  )
}

export default page
