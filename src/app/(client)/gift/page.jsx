"use client"
import { Provider } from 'react-redux'
import store from '../../../redux/store'
import StepRenderer from '../../../components/client/brand/StepRenderer'

const page = () => {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50">
        <StepRenderer />
      </div>
    </Provider>
  )
}

export default page