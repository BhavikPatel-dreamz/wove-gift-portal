"use client"
import { Provider } from 'react-redux'
import store from '../../../redux/store'
import StepRenderer from '../../../components/client/giftflow/StepRenderer'
import Header from '../../../components/client/home/Header';
import Footer from "../../../components/client/home/Footer"
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { resetFlow } from '../../../redux/giftFlowSlice';

const page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetFlow());
  }, []);

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <StepRenderer />
        <Footer />
      </div>
    </Provider>
  )
}

export default page