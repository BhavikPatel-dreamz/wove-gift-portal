"use client"
import { Provider } from 'react-redux'
import store from '../../../redux/store'
import Header from '../../../components/client/home/Header';
import ContactMain from '../../../components/client/contact/ContactMain';
import Footer from "../../../components/client/home/Footer"

const page = () => {

    return (
        <Provider store={store}>
            <div className="min-h-screen bg-gray-50">
                <Header />
                <ContactMain/>
                <Footer />
            </div>
        </Provider>
    )
}

export default page
