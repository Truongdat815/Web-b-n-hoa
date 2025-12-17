import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useLocation } from 'react-router-dom';
import '../assets/css/home.css';

const CustomerLayout = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  const isAuthPage =
    path === '/login' ||
    path === '/register' ||
    path === '/account/login' ||
    path === '/account/register';

  return (
    <div className={`customer-layout ${isAuthPage ? 'auth-page' : ''}`}>
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
