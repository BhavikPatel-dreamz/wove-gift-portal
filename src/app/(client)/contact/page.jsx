import Header from '../../../components/client/home/Header';
import ContactMain from '../../../components/client/contact/ContactMain';
import Footer from "../../../components/client/home/Footer"

const page = () => {

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <ContactMain />
            <Footer />
        </div>
    )
}

export default page
