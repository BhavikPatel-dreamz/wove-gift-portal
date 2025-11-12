"use client"
import { Provider } from 'react-redux'
import store from '../../../redux/store'
import StepRenderer from '../../../components/client/giftflow/StepRenderer'
import Header from '../../../components/client/home/Header';

const page = () => {

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <StepRenderer />
      </div>
    </Provider>
  )
}

export default page