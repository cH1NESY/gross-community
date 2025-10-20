import React, { useEffect, useRef, useState } from 'react';
import { Users, Heart, Calendar, MessageSquare, MapPin, TrendingUp } from 'lucide-react';

const BenefitsSection: React.FC = () => {
  const sections = [
    {
      id: 'friends',
      icon: Users,
      title: 'Подруги в каждом городе',
      description: 'Женское комьюнити, объединяющее активных, осознанных, вдохновляющих женщин со всей России! Ты не одна — теперь в каждом городе у тебя есть подруги.',
      image: 'https://images.pexels.com/photos/1181724/pexels-photo-1181724.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Встречи в новых городах', 'Локальные чаты', 'Помощь в переезде', 'Networking события'],
      stats: { number: '50+', label: 'городов' }
    },
    {
      id: 'support',
      icon: Heart,
      title: 'Взаимная поддержка и коллаборации',
      description: 'Наше комьюнити — это пространство для женщин, где царит доверие, доброта и вдохновение. Здесь встречаются девушки разных возрастов, профессий и интересов, которых объединяет одно — желание быть собой, получать и давать поддержку друг другу.',
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Менторство', 'Совместные проекты', 'Эмоциональная поддержка', 'Обмен опытом'],
      stats: { number: '24/7', label: 'поддержка' }
    },
    {
      id: 'events',
      icon: Calendar,
      title: 'Более 50 мероприятий в год',
      description:
        'В нашем комьюнити жизнь кипит! Каждый месяц мы собираемся на самые разные события — от душевных встреч до ярких бизнес-активностей. В год проходит более 50 мероприятий, и все они уже включены в твою подписку — никаких дополнительных взносов, только удовольствие, развитие и новые знакомства.',
      image: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Бизнес-конференции', 'Мастер-классы', 'Неформальные встречи', 'Онлайн вебинары'],
      stats: { number: '50+', label: 'событий в год' }
    },
    {
      id: 'chats',
      icon: MessageSquare,
      title: 'Чаты по интересам',
      description:
        'Наше комьюнити — это не просто место для общения. Это живое пространство, где каждая женщина может развиваться, вдохновляться и быть в кругу единомышленниц. Мы создали онлайн-чаты по интересам, чтобы каждая участница могла найти своё направление, своих людей и своё состояние баланса — дух, душа и тело.',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Тематические чаты', 'Экспертные советы', 'Актуальные обсуждения', 'Полезные ресурсы'],
      stats: { number: '15+', label: 'тематических чатов' }
    },
    {
      id: 'tours',
      icon: MapPin,
      title: 'Совместные туры',
      description:
        'Наше комьюнити — это не только встречи и чаты онлайн. Мы любим путешествовать вместе, открывать новые города, страны и впечатления. Туры — это про дружбу, вдохновение и маленькие женские приключения, которые запоминаются навсегда. Мы ездим локально, навещая друг друга в разных городах, открываем уютные кафе, красивые локации, устраиваем фотосессии и просто наслаждаемся живым общением. А ещё мы отправляемся в международные поездки, где соединяются отдых, развитие и душевная атмосфера нашего комьюнити.',
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Премиум направления', 'Комфортное размещение', 'Культурная программа', 'Безопасность']
    },
    {
      id: 'earnings',
      icon: TrendingUp,
      title: 'Возможность заработка',
      description: 'Монетизируйте свои навыки и знания. Партнерские программы, реферальная система и эксклюзивные предложения для участниц сообщества.',
      image: 'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Партнерские программы', 'Реферальная система', 'Бизнес возможности', 'Инвестиционные проекты']
    },
  ];

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chatsRef = useRef<HTMLDivElement | null>(null);
  const toursRef = useRef<HTMLDivElement | null>(null);
  const [chatsActiveIndex, setChatsActiveIndex] = useState<number>(0);
  const [showTourArrows, setShowTourArrows] = useState<boolean>(false);
  const chatsCountRef = useRef<number>(0);
  const cardWidthRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);
  const currentIndexRef = useRef<number>(1); // starts at 1 because of leading clone

  useEffect(() => {
    const scroller = chatsRef.current;
    if (!scroller) return;
    // initialize infinite carousel like club500
    if (!isInitializedRef.current) {
      const children = Array.from(scroller.children);
      chatsCountRef.current = children.length;
      // compute width incl. gap
      const first = children[0] as HTMLElement | undefined;
      const gap = parseInt(getComputedStyle(scroller).columnGap || '0', 10) || 24;
      cardWidthRef.current = (first?.offsetWidth || 320) + gap;
      // prepend last clone and append first clone
      const firstClone = first?.cloneNode(true) as HTMLElement | undefined;
      const last = children[children.length - 1] as HTMLElement | undefined;
      const lastClone = last?.cloneNode(true) as HTMLElement | undefined;
      if (firstClone) scroller.appendChild(firstClone);
      if (lastClone) scroller.insertBefore(lastClone, scroller.firstChild);
      // jump to first real card
      scroller.scrollLeft = cardWidthRef.current;
      isInitializedRef.current = true;
    }
    const onScroll = () => {
      setChatsActiveIndex(Math.round(scroller.scrollLeft / Math.max(cardWidthRef.current, 1)));
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (toursRef.current) {
      setShowTourArrows((toursRef.current.children?.length || 0) > 1);
    }
  }, []);

  const scrollChatsTo = (index: number) => {
    const scroller = chatsRef.current;
    if (!scroller) return;
    const first = scroller.firstElementChild as HTMLElement | null;
    const cardWidth = first ? first.offsetWidth + 16 : 300;
    scroller.scrollTo({ left: Math.max(index, 0) * cardWidth, behavior: 'smooth' });
  };

  // Controls for chats with seamless infinite effect
  const getCardWidth = () => cardWidthRef.current || 360;

  const handleChatsNext = () => {
    const scroller = chatsRef.current;
    if (!scroller) return;
    const w = getCardWidth();
    currentIndexRef.current += 1;
    scroller.style.scrollBehavior = 'smooth';
    scroller.scrollLeft += w;
    scroller.addEventListener(
      'transitionend',
      () => {},
      { once: true }
    );
    setTimeout(() => {
      if (currentIndexRef.current >= chatsCountRef.current + 1) {
        scroller.style.scrollBehavior = 'auto';
        scroller.scrollLeft = w;
        // force reflow then restore smooth to avoid jank
        void scroller.offsetHeight;
        scroller.style.scrollBehavior = 'smooth';
        currentIndexRef.current = 1;
      }
    }, 320);
  };

  const handleChatsPrev = () => {
    const scroller = chatsRef.current;
    if (!scroller) return;
    const w = getCardWidth();
    currentIndexRef.current -= 1;
    scroller.style.scrollBehavior = 'smooth';
    scroller.scrollLeft -= w;
    setTimeout(() => {
      if (currentIndexRef.current <= 0) {
        scroller.style.scrollBehavior = 'auto';
        scroller.scrollLeft = chatsCountRef.current * w;
        void scroller.offsetHeight;
        scroller.style.scrollBehavior = 'smooth';
        currentIndexRef.current = chatsCountRef.current;
      }
    }, 320);
  };

  const handleToursScroll = (dir: 'prev' | 'next') => {
    const scroller = toursRef.current;
    if (!scroller) return;
    const shift = scroller.clientWidth * 0.9;
    scroller.scrollBy({ left: dir === 'next' ? shift : -shift, behavior: 'smooth' });
  };

  const renderRichText = (text: string) => {
    const normalized = text.replace(/\\n/g, '\n');
    const lines = normalized.split(/\r?\n/);

    // Detect explicit bullets
    const allBullets = lines.every((l) => !l || l.trim().startsWith('•') || l.trim().startsWith('-'));
    if (allBullets) {
      return (
        <ul className="list-disc list-inside text-pink-100 space-y-1">
          {lines.filter(Boolean).map((l, i) => (
            <li key={i} className="text-sm leading-relaxed">{l.replace(/^([•\-]\s*)/, '')}</li>
          ))}
        </ul>
      );
    }

    // Detect pattern "Мы проводим:" then subsequent lines as list until blank line
    const listStartIdx = lines.findIndex((l) => l.trim().toLowerCase() === 'мы проводим:');
    if (listStartIdx !== -1) {
      const before = lines.slice(0, listStartIdx).filter(Boolean);
      const after = lines.slice(listStartIdx + 1);
      const list: string[] = [];
      let i = 0;
      for (; i < after.length; i++) {
        const t = after[i].trim();
        if (!t) break;
        list.push(t.replace(/[;\s]+$/g, ''));
      }
      const rest = after.slice(i).filter(Boolean);
      return (
        <div className="space-y-2">
          {before.map((l, idx) => (
            <p key={`p-${idx}`} className="text-sm text-pink-100 leading-relaxed m-0">{l}</p>
          ))}
          <div>
            <p className="text-sm text-pink-100 leading-relaxed m-0">Мы проводим:</p>
            <ul className="list-disc list-inside text-pink-100 space-y-1 mt-2">
              {list.map((item, idx) => (
                <li key={`li-${idx}`} className="text-sm leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>
          {rest.map((l, idx) => (
            <p key={`r-${idx}`} className="text-sm text-pink-100 leading-relaxed m-0">{l}</p>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {lines.filter(Boolean).map((l, i) => (
          <p key={i} className="text-sm text-pink-100 leading-relaxed m-0">{l}</p>
        ))}
      </div>
    );
  };

  const HoverInfo: React.FC<{ index: number; title: string; content: string }> = ({ index, title, content }) => (
    <div
      className="relative group border border-pink-500/20 rounded-xl p-4 bg-black/20 overflow-visible"
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex((prev) => (prev === index ? null : prev))}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">{title}</h4>
        <span className="text-pink-300 text-sm">наведите</span>
      </div>
      {hoveredIndex === index && (
        <div className="absolute left-0 right-0 top-full mt-2 z-20">
          <div className="fade-in-up rounded-xl border border-pink-500/40 bg-pink-900 p-0 shadow-2xl overflow-hidden max-w-3xl">
            <div className="bg-pink-800/60 px-4 py-3 text-pink-100 text-sm font-semibold">
              {title}
            </div>
            <div className="p-4 space-y-2">{renderRichText(content)}</div>
          </div>
        </div>
      )}
    </div>
  );

  const HoverInfoOverlay: React.FC<{ index: number; title: string; content: string }> = ({ index, title, content }) => (
    <div
      className="relative group border border-pink-500/20 rounded-xl p-4 bg-black/20 overflow-visible"
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex((prev) => (prev === index ? null : prev))}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">{title}</h4>
        <span className="text-pink-300 text-sm">наведите</span>
      </div>
      {hoveredIndex === index && (
        <div className="absolute left-0 right-0 top-full mt-2 z-20">
          <div className="fade-in-up rounded-xl border border-pink-500/40 bg-pink-900 p-0 shadow-2xl overflow-hidden max-w-3xl">
            <div className="bg-pink-800/60 px-4 py-3 text-pink-100 text-sm font-semibold">
              {title}
            </div>
            <div className="p-4 space-y-2">{renderRichText(content)}</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-black to-gray-900">
      {sections.map((section, index) => {
        const IconComponent = section.icon;
        const isReverse = index % 2 === 1;
        
        return (
          <section key={section.id} id={section.id} className="py-24 border-b border-pink-500/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`grid grid-cols-1`}>
                <div className={`space-y-8`}>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-3xl lg:text-4xl font-bold text-white">
                        {section.title}
                      </h2>
                    </div>
                    
                    <p className="text-lg text-gray-300 leading-relaxed text-justify whitespace-pre-line">
                      {section.description}
                    </p>
                    
                    {section.id === 'friends' ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="rounded-xl border border-pink-500/20 bg-black/20 p-5 hover:bg-black/30 transition-colors">
                            <h4 className="text-white font-semibold mb-2">Кто мы?</h4>
                            <p className="text-pink-100 text-sm">
                              Мы — онлайн-комьюнити с живыми филиалами в разных городах. Мы — как большая компания подруг, где каждая найдёт поддержку и вдохновение в любом уголке страны.
                            </p>
                          </div>
                          <div className="rounded-xl border border-pink-500/20 bg-black/20 p-5 hover:bg-black/30 transition-colors">
                            <h4 className="text-white font-semibold mb-2">Что мы создаём?</h4>
                            <p className="text-pink-100 text-sm">
                              Женскую экосистему нового формата: не просто чат и встречи, а культуру солидарности и связи, которая не знает расстояний.
                            </p>
                          </div>
                          <div className="rounded-xl border border-pink-500/20 bg-black/20 p-5 hover:bg-black/30 transition-colors">
                            <h4 className="text-white font-semibold mb-2">Зачем мы это делаем?</h4>
                            <ul className="list-disc list-inside text-pink-100 text-sm space-y-1">
                              <li>Чтобы женщины поддерживали женщин</li>
                              <li>Чтобы легко знакомиться и дружить</li>
                              <li>Чтобы обмениваться опытом и контактами</li>
                            </ul>
                          </div>
                        </div>

                        {/* CTA в конце блока "Подруги в каждом городе" */}
                        <div className="mt-8 rounded-2xl bg-gradient-to-r from-pink-900/30 to-black/30 p-6 border border-pink-500/20">
                          <p className="text-pink-200 text-base sm:text-lg text-center leading-relaxed whitespace-pre-line">
                            Мы — за женскую силу, связь и вдохновение.
                            <br />
                            Хочешь найти своих подруг по всей стране?
                            <br />
                            Добро пожаловать в комьюнити, где тебя уже ждут.
                          </p>
                          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button onClick={() => window.dispatchEvent(new Event('open-join-modal'))} className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg w-full">
                              Присоединиться к нам
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 text-pink-100 px-6 py-3 rounded-lg font-semibold border border-white/20 transition-all w-full">
                              Узнать больше о филиалах
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 text-pink-100 px-6 py-3 rounded-lg font-semibold border border-white/20 transition-all text-center w-full">
                              Подать заявку на открытие филиала в новом городе
                            </button>
                          </div>
                        </div>
                      </>
                    ) : section.id === 'support' ? (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="rounded-2xl border border-pink-500/20 bg-black/20 p-6">
                            <h4 className="text-white font-semibold mb-2">🤍 Взаимная поддержка</h4>
                            <p className="text-pink-100 whitespace-pre-line text-sm text-justify">
                              {'В нашем сообществе можно говорить обо всём: радостях, сложностях, мечтах и целях. Здесь тебя поймут, примут и поддержат — без оценок и сравнений.\nМы верим, что женская сила — в искренности и взаимопомощи. Здесь находят настоящих подруг, рядом и в радости, и в сомнениях.'}
                              </p>
                          </div>
                          <div className="rounded-2xl border border-pink-500/20 bg-black/20 p-6">
                            <h4 className="text-white font-semibold mb-2">👩🏼‍💻 Коллаборации</h4>
                            <p className="text-pink-100 text-sm text-justify">
                              Пространство возможностей: среди участниц — эксперты из разных сфер, инфлюенсеры, предприниматели, фрилансеры и креативные личности из разных городов.
                            </p>
                          </div>
                        </div>
                        <div className="mt-6 space-y-3 text-pink-100">
                          <p>
                            Мы открыты к совместным проектам, обмену опытом и идеями. Здесь легко найти партнёра для коллаборации, потенциального клиента или просто вдохновляющего союзника по делу.
                          </p>
                          <p>
                            Мы помогаем друг другу развиваться, делиться аудиторией, расширять горизонты и вместе создавать новые возможности.
                          </p>
                          <p>
                            <span className="text-pink-200">😍 Наше сообщество — про искренность, дружбу и поддержку.</span> Здесь женщины искренне радуются успехам друг друга, вдохновляют, помогают и верят, что вместе можно всё.
                          </p>
                        </div>
                        <div className="mt-6">
                          <button onClick={() => window.dispatchEvent(new Event('open-join-modal'))} className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg">
                            Вступить
                          </button>
                        </div>
                      </>
                    ) : section.id === 'events' ? (
                      <>
                        <div className="grid gap-4 overflow-visible">
                          <HoverInfoOverlay
                            index={20}
                            title="💬 Живые встречи и общение"
                            content={
                              'Каждую неделю — один или два повода выйти из рутины, вдохновиться и провести время в компании близких по духу женщин. Мы устраиваем офлайн-встречи, мастермайнды, интерактивные игры, коуч-сессии, вечера разговоров по душам, а иногда просто собираемся на уютный girls talk с чашкой кофе.'
                            }
                          />
                          <HoverInfoOverlay
                            index={21}
                            title="🌸 Развитие и вдохновение"
                            content={
                              'Наши мероприятия — это не только про веселье, но и про рост.\nМы проводим:\nмастер-классы и тренинги по личностному развитию, психологии и женственности;\nбизнес-завтраки и инстазавтраки — лёгкие, вдохновляющие и очень полезные для тех, кто хочет развивать своё дело;\nмастермайнды для обмена опытом, идей и поддержки;\nлекции от экспертов и инфлюенсеров из разных сфер — от маркетинга до саморазвития;\nигровые форматы и тематические вечеринки, где можно расслабиться, посмеяться и зарядиться энергией.'
                            }
                          />
                          <HoverInfoOverlay
                            index={22}
                            title="💖 Атмосфера, ради которой хочется возвращаться"
                            content={
                              'Все наши встречи объединяет одно — душевность и живое общение. Мы смеёмся, делимся опытом, поддерживаем друг друга, вместе развиваемся и вдохновляемся.\nВ нашем клубе ты не просто участница — ты часть тёплого, дружеского комьюнити, где каждая женщина важна, интересна и ценна.'
                            }
                          />
                          <HoverInfoOverlay
                            index={23}
                            title="🌷 Более 50 мероприятий в год"
                            content={
                              '🌷 Более 50 мероприятий в год — это возможность жить ярче, чувствовать поддержку и быть частью круга амбициозных, искренних и настоящих женщин.'
                            }
                          />
                        </div>
                        <div className="mt-6">
                          <button onClick={() => window.dispatchEvent(new Event('open-join-modal'))} className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg">
                            Стать частью комьюнити
                          </button>
                        </div>
                      </>
                    ) : section.id === 'chats' ? (
                      <>
                        <div className="relative z-0">
                          <button
                            aria-label="Prev"
                            className="hidden md:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm pointer-events-auto"
                            onClick={handleChatsPrev}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="15 18 9 12 15 6"></polyline></svg>
                          </button>
                          <div ref={chatsRef} data-chats-scroller className="flex gap-6 overflow-x-auto pb-3 scrollbar-hide px-16 scroll-smooth z-0">
                            <div
                              className="relative min-w-[360px] min-h-[260px] snap-start rounded-2xl border border-pink-500/20 bg-black/20 p-6 overflow-hidden"
                              style={{ backgroundImage: 'url(https://i.pinimg.com/736x/92/08/e6/9208e6fe18bb9c1331de546478bc7387.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                            >
                              <div className="absolute inset-0 bg-black/55" />
                              <div className="relative z-10">
                              <h4 className="text-white font-semibold mb-2">🌿 Душа</h4>
                              <p className="text-pink-100 text-sm whitespace-pre-line text-justify">{'• Чат Болталка — уютный чат, где можно поговорить обо всём.\n\n• Чат с психологом — пространство осознанности и заботы о себе.'}</p>
                              </div>
                            </div>
                            <div
                              className="relative min-w-[360px] min-h-[260px] snap-start rounded-2xl border border-pink-500/20 bg-black/20 p-6 overflow-hidden"
                              style={{ backgroundImage: 'url(https://i.pinimg.com/736x/98/86/80/9886801f070c8fc907a704edd427ff76.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                            >
                              <div className="absolute inset-0 bg-black/55" />
                              <div className="relative z-10">
                              <h4 className="text-white font-semibold mb-2">💪 Тело</h4>
                              <p className="text-pink-100 text-sm whitespace-pre-line text-justify">{'• Фитнес-чат — совместные тренировки и мотивация.\n\n• Растяжка и лимфодренаж — гибкость и лёгкость.\n\n• Питание — здоровые привычки и рацион от нутрициолога.'}</p>
                              </div>
                            </div>
                            <div
                              className="relative min-w-[360px] min-h-[260px] snap-start rounded-2xl border border-pink-500/20 bg-black/20 p-6 overflow-hidden"
                              style={{ backgroundImage: 'url(https://i.pinimg.com/236x/8c/7b/a4/8c7ba41a4a280a913d8b4a14bdf8b250.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                            >
                              <div className="absolute inset-0 bg-black/55" />
                              <div className="relative z-10">
                              <h4 className="text-white font-semibold mb-2">✨ Дух</h4>
                              <p className="text-pink-100 text-sm text-justify">{'• Духовное развитие — про смысл, гармонию и внутренний рост.'}</p>
                              </div>
                            </div>
                            <div
                              className="relative min-w-[360px] min-h-[260px] snap-start rounded-2xl border border-pink-500/20 bg-black/20 p-6 overflow-hidden"
                              style={{ backgroundImage: 'url(https://i.pinimg.com/originals/07/df/26/07df26bdd55c682084dfd7208cab51f4.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                            >
                              <div className="absolute inset-0 bg-black/55" />
                              <div className="relative z-10">
                              <h4 className="text-white font-semibold mb-2">👩🏼‍💻 Развитие</h4>
                              <p className="text-pink-100 text-sm whitespace-pre-line text-justify">{'• Инстаграм-чат — личный бренд, визуал и монетизация.\n\n• Чат Активности — взаимная поддержка контента.'}</p>
                              </div>
                            </div>
                            <div
                              className="relative min-w-[360px] min-h-[260px] snap-start rounded-2xl border border-pink-500/20 bg-black/20 p-6 overflow-hidden"
                              style={{ backgroundImage: 'url(https://i.pinimg.com/236x/27/3e/94/273e94943085820531d9b0059e20e46d.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                            >
                              <div className="absolute inset-0 bg-black/55" />
                              <div className="relative z-10">
                              <h4 className="text-white font-semibold mb-2">✈️ Путешествия</h4>
                              <p className="text-pink-100 text-sm text-justify">{'• Чат «Туры» — совместные поездки от локальных выездов до международных туров.'}</p>
                              </div>
                            </div>
                          </div>
                          {/* убраны точки пагинации по запросу */}
                          <button
                            aria-label="Next"
                            className="hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm"
                            onClick={handleChatsNext}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </button>
                        </div>
                        <div className="mt-6 space-y-3 text-pink-100">
                          <p>
                            Развитие без границ! Наши чаты — живые и постоянно развиваются. Мы регулярно добавляем новые направления, приглашаем спикеров, экспертов и коучей, которые делятся опытом, проводят эфиры, дают советы и помогают раскрыть потенциал каждой участницы.
                          </p>
                          <p>
                            💖 Здесь каждая женщина найдёт пространство по душе — для общения, роста и вдохновения. В нашем комьюнити можно быть собой, расти и вместе с другими идти к своей лучшей версии — шаг за шагом, с любовью к жизни и к себе.
                          </p>
                        </div>
                        <div className="mt-6">
                          <button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg">
                            Присоединиться
                          </button>
                        </div>
                      </>
                    ) : section.id === 'tours' ? (
                      <>
                        <div className="mt-6">
                          <h4 className="text-2xl font-semibold text-white mb-4">Ближайшие туры</h4>
                          <div className="-mx-4 sm:-mx-6 lg:-mx-8">
                            <div className="relative w-full bg-gradient-to-r from-pink-900/20 to-black/20 border border-pink-500/20 rounded-2xl overflow-hidden">
                              {showTourArrows && (
                              <button
                                aria-label="Prev tours"
                                className="hidden md:flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm"
                                onClick={() => handleToursScroll('prev')}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="15 18 9 12 15 6"></polyline></svg>
                              </button>
                              )}
                              <div ref={toursRef} className="grid grid-flow-col auto-cols-[minmax(280px,1fr)] gap-6 overflow-x-auto scroll-smooth px-12 py-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 w-[min(1100px,90vw)]">
                                <div
                                  className="relative min-h-[300px] lg:min-h-[420px]"
                                  style={{ backgroundImage: 'url(https://www.flagman.travel/upload/medialibrary/8a4/8a40949a8aaa3588794fc909afc790c8.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                                >
                                  <div className="absolute inset-0 bg-black/40" />
                                  <div className="relative z-10 p-6 lg:p-10">
                                    <div className="text-3xl font-extrabold text-white">Таиланд</div>
                                    <div className="mt-2 text-pink-200 font-medium">25 ноября — 9 декабря</div>
                                  </div>
                                </div>
                                <div className="p-6 lg:p-10 text-pink-100 space-y-3">
                                  <p>
                                    Нас ждёт путешествие мечты! Море, солнце, закаты и длинные разговоры под шум волн.
                                    Мы подготовили всё — готовые путёвки, комфортное совместное проживание, насыщенную программу и время для отдыха.
                                  </p>
                                  <div>
                                    <p className="m-0 text-pink-200 font-semibold">Что будет:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                      <li>фотосессии на пляже и в красивых локациях;</li>
                                      <li>экскурсии и совместные активности;</li>
                                      <li>женские разговоры по душам и вдохновляющие вечера;</li>
                                      <li>ивенты, мастермайнды и лёгкие практики;</li>
                                      <li>море радости, тепла и энергии.</li>
                                    </ul>
                                  </div>
                                  <div className="pt-2">
                                    <button onClick={() => window.dispatchEvent(new Event('open-join-modal'))} className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg">
                                      Подать заявку
                                    </button>
                                  </div>
                                </div>
                                </div>
                                {/* Дополнительные туры можно добавлять сюда аналогичными карточками */}
                              </div>
                              {showTourArrows && (
                              <button
                                aria-label="Next tours"
                                className="hidden md:flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm"
                                onClick={() => handleToursScroll('next')}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="9 18 15 12 9 6"></polyline></svg>
                              </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : section.id === 'earnings' ? (
                      <>
                        <div className="grid gap-4">
                          <div className="rounded-xl border border-pink-500/20 bg-black/20 p-5">
                            <p className="text-pink-100">
                              Наше комьюнити — это не только пространство для общения, вдохновения и развития, но и реальная возможность зарабатывать, оставаясь в кругу единомышленниц.
                            </p>
                          </div>
                          <div className="rounded-xl border border-pink-500/20 bg-black/20 p-5">
                            <h4 className="text-white font-semibold mb-2">🌷 Как это работает</h4>
                            <p className="text-pink-100 whitespace-pre-line">
                              В клубе действует ежемесячная подписка, и каждая участница может приглашать подруг, коллег или знакомых присоединиться к нам. За каждую приглашённую участницу ты получаешь вознаграждение до 40% — причём не только с прямых приглашений, но и с пяти уровней твоей команды.
                              {`\n`}Это значит, что, просто делясь тем, что тебе действительно нравится, ты можешь создать для себя дополнительный стабильный доход — без сложных схем и навязчивых продаж.
                            </p>
                          </div>
                          <div className="rounded-xl border border-pink-500/20 bg-black/20 p-5">
                            <h4 className="text-white font-semibold mb-2">💫 Почему это легко и приятно</h4>
                            <ul className="list-disc list-inside text-pink-100 space-y-1">
                              <li>Ты рекомендуешь живое и вдохновляющее комьюнити, которое сама любишь.</li>
                              <li>Девушки приходят не “на продукт”, а в атмосферу поддержки, общения и развития.</li>
                              <li>Всё прозрачно: доходы рассчитываются автоматически, и ты всегда видишь свой результат.</li>
                              <li>Чем активнее ты вовлечена — тем больше возможностей открывается!</li>
                            </ul>
                          </div>
                          <div className="rounded-xl border border-pink-500/20 bg-black/20 p-5">
                            <p className="text-pink-100">
                              💖 В нашем сообществе ты не просто участница — ты можешь быть амбассадором вдохновения. Поддерживай других, развивайся сама и зарабатывай вместе с комьюнити, которое объединяет женщин по всему миру.
                            </p>
                          </div>
                        </div>
                        <div className="mt-6">
                          <button onClick={() => window.dispatchEvent(new Event('open-join-modal'))} className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg">
                            Узнать подробности
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {section.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-900/20 to-black/20 rounded-lg border border-pink-500/10">
                          <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"></div>
                          <span className="text-white">{feature}</span>
                        </div>
                      ))}
                    </div>
                      </>
                    )}
                    
                    {/* Статистика: показываем только если есть данные и раздел не входит в исключения */}
                    {section.stats && section.id !== 'friends' && section.id !== 'support' && section.id !== 'events' && section.id !== 'chats' && (
                    <div className="bg-gradient-to-r from-pink-900/30 to-black/30 p-6 rounded-2xl border border-pink-500/20">
                      <div className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
                          {section.stats.number}
                        </div>
                        <div className="text-pink-300 font-medium">{section.stats.label}</div>
                      </div>
                    </div>
                    )}
                  </div>
                </div>
                
                {false && (
                <div className={`relative ${isReverse ? 'lg:order-1' : ''}`}>
                  <div className="aspect-[4/3] bg-gradient-to-br from-pink-600 to-pink-800 rounded-3xl p-6 shadow-2xl">
                    <img
                      src={section.image}
                      alt={section.title}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-pink-500 to-pink-700 rounded-full opacity-20"></div>
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full opacity-30"></div>
                </div>
                )}
              </div>
              
              {/* Разделитель между секциями */}
              {index < sections.length - 1 && (
                <div className="mt-24 flex justify-center">
                  <div className="w-32 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
                </div>
              )}
            </div>
          </section>
        );
      })}
      
      {/* Итоговый CTA-блок (заменён на крупный вопрос) */}
      <section className="py-24 bg-gradient-to-r from-pink-900 to-black">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-wide text-white">
            ГОТОВА НАЙТИ ПОДРУГ ПО ВСЕЙ СТРАНЕ?
          </div>
          <div className="mt-6 flex items-center justify-center">
            <button onClick={() => window.dispatchEvent(new Event('open-join-modal'))} className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-10 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg">
              Вступить
          </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BenefitsSection;