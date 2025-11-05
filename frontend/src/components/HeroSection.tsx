import React from 'react';

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



  return (
    <section className="py-8 sm:py-12 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Gross
                <br />
                <span className="bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">Community</span>
              </h1>
              <p className="text-lg sm:text-xl text-primary-300 font-medium">
                женский клуб подружек
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center text-left text-sm sm:text-base text-white hover:text-pink-300 cursor-pointer transition-all duration-200 p-2 rounded-lg hover:bg-pink-900/20 group"
                  onClick={() => onScrollToSection(benefit.id)}
                >
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full mr-3 group-hover:scale-125 transition-transform duration-200 flex-shrink-0"></div>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">{benefit.text}</span>
                </div>
              ))}
            </div>
            
            <button
              onClick={onJoinClick}
              className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 text-base sm:text-lg inline-flex items-center justify-center space-x-2"
            >
              <span>Вступить</span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
          
          <div className="relative order-1 lg:order-2">
            <div className="w-full max-w-[280px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[450px] mx-auto aspect-[3/4] sm:aspect-[3/4.1] bg-gradient-to-br from-pink-600 to-pink-800 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl flex items-center justify-center overflow-hidden">
              <img
                src="/0.jpg"
                alt="Успешная женщина"
                className="w-full h-full object-cover rounded-xl"
                style={{
                  imageRendering: 'auto'
                }}
              />
            </div>
            {/* Декоративные элементы */}
            <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-500 to-pink-700 rounded-full opacity-20"></div>
            <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full opacity-30"></div>
          </div>
        </div>
      </div>
      
      {/* Блок презентации на всю ширину без рамок */}
      <div className="mt-12 sm:mt-16 lg:mt-20">
        <div className="w-screen relative left-1/2 -translate-x-1/2">
          <video
            className="w-full aspect-video object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="" type="video/mp4" />
            {/* Fallback изображение если видео не загрузится */}
            <img
              src=""
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