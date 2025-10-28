import { useEffect, useState } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import BenefitsSection from './components/BenefitsSection';
import Account from './pages/Account';
import Payment from './pages/Payment';
import Login from './pages/Login';
import JoinModal from './components/JoinModal';
import ConsultationModal from './components/ConsultationModal';

export interface FormData {
  fullName: string;
  telegramTag: string;
  phone: string;
  city: string;
  email: string;
  referralLink: string;
  agreeToPolicy: boolean;
  password?: string;
  confirmPassword?: string;
}

function App() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false); // reserved for future
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [currentHash, setCurrentHash] = useState<string>(window.location.hash);
  const [consultationUserData, setConsultationUserData] = useState<{
    fullName: string;
    phone: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const openJoinHandler = () => setShowJoinModal(true);
    window.addEventListener('open-join-modal', openJoinHandler as EventListener);
    const onHash = () => {
      try {
        const newHash = window.location.hash || '';
        console.log('Hash changed to:', newHash);
        setCurrentHash(newHash);
      } catch (error) {
        console.error('Error handling hash change:', error);
        // В случае ошибки устанавливаем дефолтный hash
        setCurrentHash('');
      }
    };
    window.addEventListener('hashchange', onHash);
    
    // Глобальная обработка ошибок для предотвращения зависания
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      // Не даем ошибкам ломать приложение
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Не даем необработанным промисам ломать приложение
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('open-join-modal', openJoinHandler as EventListener);
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleJoinClick = () => {
    setShowJoinModal(true);
  };

  const handleCloseModal = () => {
    setShowJoinModal(false);
    setShowThankYouModal(false);
    setShowConsultationModal(false);
  };

  const handleConsultation = (userData?: FormData) => {
    setShowJoinModal(false);
    if (userData) {
      setConsultationUserData({
        fullName: userData.fullName,
        phone: userData.phone,
        email: userData.email
      });
    }
    setShowConsultationModal(true);
  };

  const handlePayment = () => {
    // Страницу благодарности показываем только на странице оплаты
    setShowJoinModal(false);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {currentHash === '#/account' ? (
          <Account />
        ) : currentHash === '#/login' ? (
          <Login />
        ) : currentHash === '#/payment' ? (
          <Payment />
        ) : (
          <>
            <HeroSection onJoinClick={handleJoinClick} onScrollToSection={scrollToSection} />
            <BenefitsSection />
          </>
        )}
      </main>
      
      {showJoinModal && (
        <JoinModal
          onClose={handleCloseModal}
          onConsultation={handleConsultation}
          onPayment={handlePayment}
        />
      )}
      
      {/* Страница благодарности показывается из Payment */}
      
      {showConsultationModal && (
        <ConsultationModal 
          onClose={handleCloseModal} 
          userData={consultationUserData || undefined}
        />
      )}
    </div>
  );
}

export default App;