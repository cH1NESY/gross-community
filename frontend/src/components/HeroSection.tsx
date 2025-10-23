import React from 'react';
import womanImg from '../images/woman.png';
import { Play } from 'lucide-react';

interface HeroSectionProps {
  onJoinClick: () => void;
  onScrollToSection: (sectionId: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onJoinClick, onScrollToSection }) => {
  const benefits = [
    { text: 'Подруги в каждом городе', id: 'friends' },
    { text: 'Взаимная поддержка и коллаборации', id: 'support' },
    { text: 'Более 50 мероприятий в год', id: 'events' },
    { text: 'Чаты по интересам', id: 'chats' },
    { text: 'Совместные туры', id: 'tours' },
    { text: 'Возможность заработка', id: 'earnings' },
  ];

  const handlePresentationClick = () => {
    // Здесь будет логика открытия презентации
    console.log('Открыть презентацию');
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Gross
                <br />
                <span className="bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">Community</span>
              </h1>
              <p className="text-xl text-primary-300 font-medium">
                женский клуб подружек
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center text-left text-base text-white hover:text-pink-300 cursor-pointer transition-all duration-200 p-2 rounded-lg hover:bg-pink-900/20 group"
                  onClick={() => onScrollToSection(benefit.id)}
                >
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full mr-3 group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">{benefit.text}</span>
                </div>
              ))}
            </div>
            
            <button
              onClick={onJoinClick}
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 text-lg inline-flex items-center space-x-2"
            >
              <span>Вступить</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
          
          <div className="relative">
            <div className="w-[400px] h-[540px] sm:w-[450px] sm:h-[620px] bg-gradient-to-br from-pink-600 to-pink-800 rounded-3xl p-6 shadow-2xl mx-auto flex items-center justify-center overflow-hidden">
              <img
                src="./../../public/0.jpg"
                alt="Успешная женщина"
                className="w-full h-full object-cover rounded-xl"
                style={{
                  imageRendering: 'auto'
                }}
              />
            </div>
            {/* Декоративные элементы */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-700 rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full opacity-30"></div>
          </div>
        </div>
      </div>
      
      {/* Блок презентации на всю ширину без рамок */}
      <div className="mt-20">
        <div className="w-full">
          <video
            className="w-full aspect-video object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
            {/* Fallback изображение если видео не загрузится */}
            <img
              src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Презентация Gross Community"
              className="w-full h-full object-cover"
            />
          </video>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;