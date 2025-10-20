import React, { useState } from 'react';

const hoverBlocks = [
  {
    title: 'Кто мы?',
    content:
      'Мы — онлайн-комьюнити с живыми филиалами в разных городах. Мы — как большая компания подруг, где каждая найдёт свою поддержку, вдохновение и тёплый приём в любом уголке страны. Наше сообщество объединяет девушек и женщин самых разных профессий, возрастов и интересов. Мы знакомимся, общаемся, делимся идеями, и просто — становимся ближе.',
  },
  {
    title: 'Что мы создаём?',
    content:
      'Женскую экосистему нового формата. Это не просто чат, не просто встречи — это целая культура женской солидарности и связи, которая не знает расстояний.',
  },
  {
    title: 'Зачем мы это делаем?',
    content:
      '•Чтобы женщины поддерживали женщин — без конкуренции, без масок, с настоящей эмпатией и интересом\n•Чтобы создавать среду, в которой легко знакомиться и дружить\n•Чтобы путешествия по России стали теплее, душевнее и насыщеннее\n•Чтобы обмениваться опытом, вдохновением и контактами\n•Чтобы строить дружбу и деловые связи, которые работают на расстоянии\n•Чтобы создать сильное, живое женское сообщество по всей России',
  },
];

const FriendsInEveryCity: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="bg-white">
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          Подруги в каждом городе
        </h1>
        <p className="mt-4 text-lg text-gray-700 max-w-3xl">
          Женское комьюнити, объединяющее активных, осознанных, вдохновляющих женщин со всей России!
          <br />
          Ты не одна — теперь в каждом городе у тебя есть подруги.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6 pb-12">
        {hoverBlocks.map((item, index) => (
          <div
            key={item.title}
            className="relative group border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex((prev) => (prev === index ? null : prev))}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
              <span className="text-pink-600 font-medium opacity-90">подробнее</span>
            </div>
            <div className="mt-3 text-gray-600">
              Наведи курсор, чтобы узнать больше
            </div>

            {hoveredIndex === index && (
              <div className="absolute inset-x-0 top-full mt-3 z-10">
                <div className="rounded-xl border border-pink-200 bg-pink-50 p-4 shadow-lg">
                  <p className="whitespace-pre-line text-sm text-pink-900">
                    {item.content}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 p-8 text-center">
          <p className="text-lg sm:text-xl text-gray-800">
            Мы — за женскую силу, связь и вдохновение.
            <br />
            Хочешь найти своих подруг по всей стране?
            <br />
            Добро пожаловать в комьюнити, где тебя уже ждут.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button className="inline-flex items-center justify-center rounded-lg bg-pink-600 px-5 py-2.5 text-white font-medium shadow hover:bg-pink-700 transition-colors">
              Присоединиться к нам
            </button>
            <button className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-pink-700 font-medium border border-pink-300 hover:bg-pink-50 transition-colors">
              Узнать больше о филиалах
            </button>
            <button className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-pink-700 font-medium border border-pink-300 hover:bg-pink-50 transition-colors">
              Подать заявку на открытие филиала
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FriendsInEveryCity;


