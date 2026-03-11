import Header from "@/components/client/home/Header";
import Footer from "@/components/client/home/Footer";
import ProfilePage from "@/components/client/profile/ProfilePage";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ProfilePage />
      <Footer />
    </div>
  );
}
