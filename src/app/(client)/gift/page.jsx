"use client"
import { Provider } from 'react-redux'
import store from '../../../redux/store'
import StepRenderer from '../../../components/client/brand/StepRenderer'
import Header from '../../../components/client/home/Header';

const page = () => {

  const headerData = {
    logo: "Wave Gifts",
    navigation: ["Home", "About", "FAQ", "Send Gift Card", "Brands"],
    userActions: ["EN", "Login", "Register", "Artists"]
  };

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50">
        <Header {...headerData} />
        <StepRenderer />
      </div>
    </Provider>
  )
}

export default page