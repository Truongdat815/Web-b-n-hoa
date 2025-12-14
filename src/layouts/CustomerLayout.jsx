import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import '../assets/css/home.css';

const CustomerLayout = ({ children }) => {
  return (
    <div className="customer-layout">
      <Header />

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default CustomerLayout;
