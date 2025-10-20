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

  useEffect(() => {
    const openJoinHandler = () => setShowJoinModal(true);
    window.addEventListener('open-join-modal', openJoinHandler as EventListener);
    const onHash = () => setCurrentHash(window.location.hash || '');
    window.addEventListener('hashchange', onHash);
    return () => {
      window.removeEventListener('open-join-modal', openJoinHandler as EventListener);
      window.removeEventListener('hashchange', onHash);
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

  const handleConsultation = () => {
    setShowJoinModal(false);
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
        <ConsultationModal onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default App;