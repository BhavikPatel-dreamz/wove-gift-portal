"use client"
import { Provider } from 'react-redux'
import store from '../../../redux/store'
import StepRenderer from '../../../components/client/giftflow/StepRenderer'
import Header from '../../../components/client/home/Header';
import Footer from "../../../components/client/home/Footer"
import { useEffect, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentStep } from '../../../redux/giftFlowSlice';

const page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setCurrentStep(1));
  }, []);

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Suspense fallback={<div>Loading...</div>}>
          <StepRenderer />
        </Suspense>
        <Footer />
      </div>
    </Provider>
  )
}

export default page