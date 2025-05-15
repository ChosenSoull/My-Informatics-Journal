import React, { useContext, useState, useEffect, useRef } from 'react';
import { ThemeContext } from '../theme'; // Подключаем ThemeContext
import './MainMenu.css';

const MainMenu: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext); // Получаем тему и функцию переключения
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isChapterMenuOpen, setIsChapterMenuOpen] = useState(false);
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);
  const username = 'Користувач';
  const accountNameRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isUserLoggedIn] = useState(true);

  const testComments = [
    {
      id: 101,
      avatar: '/assets/default_user_icon.png',
      name: 'Читач 1',
      message: 'Цікавий початок історії!',
    },
    {
      id: 102,
      avatar: '/assets/default_user_icon.png',
      name: 'Програміст',
      message: 'Пізнавально про перші кроки в програмуванні.',
    },
  ];

  const chapters = [
    { id: 1, title: "Вступ: Мій шлях у програмування" },
    { id: 2, title: "Розділ 1: Новий ноутбук і перші кроки" },
    { id: 3, title: "Розділ 2: Перші експерименти та відкриття" },
    { id: 4, title: "Розділ 3: Повернення до програмування" },
    { id: 5, title: "Розділ 4: Знайомство з Linux" },
    { id: 6, title: "Розділ 5: Мій перший серйозний проєкт" },
    { id: 7, title: "Висновок: Мої підсумки та плани" },
  ];

  // Функция, возвращающая объект с путями к активам в зависимости от темы
  const getThemeAssets = (currentTheme: string) => {
    const themeSuffix = currentTheme === 'light' ? '-dark' : '-light';
    return {
      logo: `/assets/icon${themeSuffix}.png`,
      themeIcon: currentTheme === 'light' ? '/assets/night-dark.png' : '/assets/day-light.png',
      themeAlt: currentTheme === 'light' ? 'Переключити на темну тему' : 'Переключити на світлу тему',
      introductionProgramming: `/assets/introduction-programming${themeSuffix}.png`,
      firstProjectIdea: `/assets/first-project-idea${themeSuffix}.png`,
      firstProject: `/assets/first-project${themeSuffix}.png`,
      plansForTheFuture: `/assets/plans-for-the-future${themeSuffix}.png`,
      steamIcon: `/assets/steam-icon${themeSuffix}.png`,
      discordIcon: `/assets/discord-icon${themeSuffix}.png`,
      telegramIcon: `/assets/telegram-icon${themeSuffix}.png`,
      githubIcon: `/assets/github-icon${themeSuffix}.png`,
      reactIcon: `/assets/react-icon${themeSuffix}.png`,
      viteIcon: `/assets/vite-icon${themeSuffix}.png`,
      typescriptIcon: `/assets/typescript-icon${themeSuffix}.png`,
      phoneIcon: `/assets/phone-icon${themeSuffix}.png`,
      emailIcon: `/assets/email-icon${themeSuffix}.png`,
      websiteIcon: `/assets/website-icon${themeSuffix}.png`,
    };
  };

  // Получаем объект с путями к активам при каждом изменении темы
  const themeAssets = getThemeAssets(theme);

  const scrollToChapter = (chapterId: number) => {
    const element = document.getElementById(`chapter-${chapterId}`);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const headerHeight = 70;
      window.scrollTo({ top: elementPosition - headerHeight, behavior: 'smooth' });
    }
    setIsChapterMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const chapter4Element = document.getElementById('chapter-4');
      if (chapter4Element) {
        const chapter4Position = chapter4Element.getBoundingClientRect().top + window.scrollY;
        setIsScrollButtonVisible(window.scrollY > chapter4Position);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsChapterMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (accountNameRef.current) {
      const frameWidth = accountNameRef.current.offsetWidth + 60;
      document.documentElement.style.setProperty('--dynamic-frame-width', `${frameWidth}px`);
    }
  }, [username]);

  return (
    <div className="page-container">
      <header className="header">
        <div className="header-left">
          <img src={themeAssets.logo} alt="Логотип" className="icon-image" />
          <span className="site-name">ChosenSoul</span>
        </div>
        <div className="header-right">
          <div className="theme-toggle" onClick={toggleTheme}>
            <img src={themeAssets.themeIcon} alt={themeAssets.themeAlt} className="theme-icon" />
          </div>
          <div className={`account-section ${isAccountOpen ? 'active' : ''}`} onClick={() => setIsAccountOpen(!isAccountOpen)}>
            <div className={`account-frame ${isAccountOpen ? 'active' : ''}`}>
              <span ref={accountNameRef} className="account-name">{username}</span>
              <img src="assets/default_user_icon.png" alt="Обліковий запис" className="account-icon" />
            </div>
            <div className={`account-tooltip ${isAccountOpen ? 'active' : ''}`}>
              <div className="tooltip-item">Реєстрація</div>
              <div className="tooltip-item">Змінити аватар</div>
              <div className="tooltip-item">Змінити ім'я</div>
              <div className="tooltip-item">Змінити пароль</div>
              <div className="tooltip-item">Вихід</div>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="content-wrapper">
          <h1 className="main-title">
            <span className="main-text">Мій шлях у</span>
            <br />
            <span className="gradient-text">програмування</span>
          </h1>
          <div className="container-start-menu">
            <p className="shadow"></p>
            <div className="box">
              <div className="block">
                <img src={themeAssets.introductionProgramming} alt="Знайомство з програмуванням" className="block-image" />
                <span className="block-text">Як я познайомився з програмуванням</span>
              </div>
              <div className="block">
                <img src={themeAssets.firstProjectIdea} alt="Ідея першого проєкту" className="block-image" />
                <span className="block-text">Ідея першого проєкту</span>
              </div>
            </div>
            <div className="box">
              <div className="block">
                <img src={themeAssets.firstProject} alt="Мій перший проєкт" className="block-image" />
                <span className="block-text">Мій перший проєкт</span>
              </div>
              <div className="block">
                <img src={themeAssets.plansForTheFuture} alt="Плани на майбутнє" className="block-image" />
                <span className="block-text">Що я планую в майбутньому</span>
              </div>
            </div>
          </div>
          <h2 className="roadmap-h2">Дорожня карта</h2>
          <div className="roadmap">
            <div className="roadmap-line"></div>
            <div className="roadmap-chapters">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="chapter-circle" onClick={() => scrollToChapter(chapter.id)}>
                  <span className="chapter-tooltip">{chapter.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Контент глав */}
          <div className="chapters-content">
            {chapters.map((chapter) => (
              <section key={chapter.id} id={`chapter-${chapter.id}`} className="chapter-section">
                <h2 className="chapter-title">{chapter.title}</h2>
                {chapter.id === 1 && (
                  <>
                    <p>
                      Усе почалося в 2023 році, коли мені було 13 років. Я навчався в 7 класі й уперше зіткнувся з програмуванням. Моїм першим завданням стало створення сайту на HTML і CSS — це було домашнє завдання з інформатики. На платформі «Нові знання» (nz.ua) я побачив це завдання, хоча до того моменту нічим подібним не займався. Я уважно читав інструкції, дивився відеоролики на YouTube і почав вивчати структуру HTML-файлу та базові стилі CSS.
                    </p>
                    <p>
                      Було вже 11 годин вечора, але я вирішив узятися до справи. У мене не було відповідних інструментів: я працював на слабкому шкільному Chromebook, на який навіть не можна встановити Windows через шкільні обмеження. Як редактор коду я використовував простий текстовий редактор під назвою Text. У ньому не було підсвітки синтаксису, розширень — лише нумерація рядків. Незважаючи на це, я почав писати код і до 4 години ранку закінчив свій перший сайт. Я навіть не помітив, як промайнув час! Саме тоді я вперше доторкнувся до розробки справжнього проєкту.
                    </p>
                  </>
                )}
                {chapter.id === 2 && (
                  <>
                    <p>
                      Через 7 місяців, у 2023 році, мій тато приніс додому старий ноутбук HP Pavilion dv6 2011 року, який йому віддав знайомий. Це був середньобюджетний ноутбук із процесором Pentium B940, 4 ГБ оперативної пам’яті та двома відеокартами: вбудованою HD2000 і дискретною Radeon HD 6490M. Оскільки я був єдиним у сім’ї, хто хоч трохи розбирався в комп’ютерах, ноутбук дістався мені. На ньому не було операційної системи, і я вирішив установити Windows 7, тому що частина драйверів не підтримувала Windows 10.
                    </p>
                    <p>
                      Я попросив старшого брата записати Windows 7 на флешку, після чого встановив систему й почав користуватися ноутбуком. До цього я вже цікавився «залізом» і знав, як працюють комп’ютери. Уперше я доторкнувся до персонального комп’ютера в 2016 році. Тоді це був старий ноутбук батьків Acer із процесором Pentium (точну модель уже не пам’ятаю). На ньому я грав у Need for Speed: Most Wanted 2005 і годинами намагався пройти першого боса — Сонні. Мамі не подобалося, що я так багато часу проводжу за ноутбуком, і вона часто забороняла мені його використовувати.
                    </p>
                  </>
                )}
                {chapter.id === 3 && (
                  <>
                    <p>
                      Згодом я почав експериментувати. Одного разу я встановив на батьківський ноутбук Acer Roblox, але ретельно приховував це від батьків. Я видалив ярлик із робочого стола й прибрав папки Roblox і Roblox Studio з меню «Пуск». Однак я не знав, як видалити програму зі списку в налаштуваннях Windows. Тоді я вперше ввів запит у Google: «Як видалити програму зі списку програм для видалення Windows?» Так я дізнався про реєстр і редактор regedit.
                    </p>
                    <p>
                      Цей момент став для мене відкриттям: я зрозумів, що за простим інтерфейсом комп’ютера ховається набагато більше, ніж бачать звичайні користувачі, яким потрібен лише браузер. Я почав вивчати, як усе працює, і мама, дізнавшись про це, стала давати мені більше часу на експерименти. Тоді я зрозумів, що мені це дійсно подобається.
                    </p>
                  </>
                )}
                {chapter.id === 4 && (
                  <>
                    <p>
                      Повернувшись у 2023 рік, я вирішив спробувати себе в ролі програміста. Мені подобалося створювати щось нове, і я вирішив, що програмування — це моє. У 7 класі я почав вивчати основи: спочатку розібрався, де й що використовується, а потім спробував себе в різних сферах. Але часу катастрофічно не вистачало: я вставав о 9 ранку, уроки тривали до 14:00, а потім ще було багато домашнього завдання.
                    </p>
                    <p>
                      У 2024 році я вирішив зосередитися тільки на інформатиці та математиці. Уроки проходили віддалено через Google Meet, і я, відкладавши телефон, читав книги з програмування. Тоді я вирішив вивчати веброзробку, доки не знайду те, що мені по-справжньому цікаво. У процесі я дізнався про рух Open Source, Git, GitHub, IDE та інші важливі терміни.
                    </p>
                  </>
                )}
                {chapter.id === 5 && (
                  <>
                    <p>
                      Одного разу я вирішив спробувати одне з головних винаходів Open Source — Linux. Ми з моїм другом Микитою Агашковим сиділи в Discord, і я запропонував експеримент: на 2 тижні перейти на Linux. Микита погодився й запропонував парі: якщо я хоч раз перевстановлю Linux на Windows, він виграє 100 грн. Я записав на флешку образ дистрибутива Ubuntu версії 24.04, але установник підтримував тільки UEFI, а мій старий ноутбук його не підтримував. Тоді я вибрав Ubuntu 22.04 і успішно його встановив. Після цього я зіткнувся з незвичним середовищем GNOME: панель зверху, величезне меню програм замість компактного «Пуску» — усе це нагадувало macOS. Я вирішив дослідити альтернативи, такі як KDE, XFCE, LXDE та інші, і з усіх варіантів мені особливо сподобався KDE. Однак Ubuntu не була оптимізована для зміни робочих середовищ, і встановлення KDE не вдалося. Усе ж я вирішив дати шанс GNOME і звикнути, але через 4 дні зрозумів, що мені незручно.
                    </p>
                    <p>
                      Протягом цих 4 днів мені знадобилися деякі програми Windows, і я встановив Wine — шар сумісності для запуску Windows-програм на Linux. Версія 4.0, стабільна для Ubuntu 22.04, виявилася застарілою (на сайті Wine уже була версія 9.2). Деякі програми не запускалися, і я вирішив спробувати дистрибутив із системою пакетів rolling-release, де всі програми оновлюються до останніх версій.
                    </p>
                    <p>
                      Мій вибір припав на Arch Linux. Багато хто вважає, що його встановлення складне через відсутність графічного інтерфейсу, але для мене воно виявилося простішим, ніж очікувалося. Після тижня налаштування я встановив робоче середовище KDE і необхідні програми: Firefox, Steam, Spotify, Telegram, а також Wine 9.3. Мені знадобився Photoshop CS6 для створення іконок для проєкту, але Adobe не підтримує Linux. За допомогою Wine я запустив Photoshop, і все запрацювало чудово.
                    </p>
                  </>
                )}
                {chapter.id === 6 && (
                  <>
                    <p>
                      У цей же час я вперше встановив IDE — Visual Studio Code, яким користуюся досі, а також GitHub Desktop для роботи з Git. Тоді я почав свій перший серйозний проєкт, який досі є на GitHub [встав посилання]. Я створював його, щоб перевірити, чому навчився за рік — із 2023 по 2024.
                    </p>
                    <p>
                      Проєкт був експериментальним: я кодив по 15 годин на день протягом 30 днів. Але з часом його стало складно розвивати й підтримувати. Я зрозумів, що зробив усе неправильно: потрібно було спочатку продумати архітектуру проєкту, визначити, що я від нього хочу, і як реалізувати ті чи інші функції. У підсумку я призупинив проєкт і почав вивчати, де помилився.
                    </p>
                  </>
                )}
                {chapter.id === 7 && (
                  <>
                    <p>
                      З часом я зрозумів, чим хочу займатися — низькорівневим програмуванням на C/C++: розробкою мікроконтролерів для комп’ютерів і різних низькорівневих систем. Тому я не вивчаю інші фреймворки, такі як Vue чи Angular — мені вистачає React.
                    </p>
                    <p>
                      Дякую, що прочитали моє домашнє завдання з інформатики та мою історію про те, як я прийшов до своєї улюбленої справи! Будь ласка, пишіть коментарі, діліться своєю думкою та вказуйте на помилки в репозиторії проєкту. Успіхів усім! 😊
                    </p>
                  </>
                )}
              </section>
            ))}
            {/* Контейнер для комментариев - теперь после всех глав */}
            {isUserLoggedIn && (
              <div className="comments-container">
                <div className="comment-input-area">
                  {/* Поле для ввода комментария (реализация будет позже) */}
                  <textarea placeholder="Залиште свій коментар..." className="comment-textarea"></textarea>
                  <button className="comment-button">Надіслати</button>
                </div>
                <div className="comments-list">
                  {testComments.map((comment) => (
                    <div key={comment.id} className="comment">
                      <img src={comment.avatar} alt={comment.name} className="comment-avatar" />
                      <div className="comment-body">
                        <span className="comment-name">{comment.name}</span>
                        <p className="comment-message">{comment.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <div
        className={`scroll-to-top ${isScrollButtonVisible ? 'visible' : ''}`}
        onClick={scrollToTop}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsChapterMenuOpen(true);
        }}
      >
        ↑
        {isChapterMenuOpen && (
          <div className={`chapter-menu ${isChapterMenuOpen ? 'visible' : ''}`} ref={menuRef}>
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="chapter-menu-item"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToChapter(chapter.id);
                }}
              >
                {chapter.title}
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="social-section">
            <div className="social-icons">
              <a href="https://steamcommunity.com/id/ChosenSoul" target="_blank" rel="noopener noreferrer">
                <img src={themeAssets.steamIcon} alt="Steam" className="social-icon" />
              </a>
              <a href="https://discordapp.com/users/912451953106255894" target="_blank" rel="noopener noreferrer">
                <img src={themeAssets.discordIcon} alt="Discord" className="social-icon" />
              </a>
              <a href="https://t.me/ChosenS0ul" target="_blank" rel="noopener noreferrer">
                <img src={themeAssets.telegramIcon} alt="Telegram" className="social-icon" />
              </a>
              <a href="https://github.com/ChosenSoull" target="_blank" rel="noopener noreferrer">
                <img src={themeAssets.githubIcon} alt="GitHub" className="social-icon" />
              </a>
            </div>
            <p className="social-label">Соціальні мережі</p>
          </div>

          <div className="tech-contact-section">
            <div className="tech-contact-wrapper">
              <div className="tech-section">
                <p className="tech-label">Використані технології</p>
                <div className="tech-icons">
                  <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">
                    <img src={themeAssets.reactIcon} alt="React" className="tech-icon" />
                  </a>
                  <a href="https://vite.dev/" target="_blank" rel="noopener noreferrer">
                    <img src={themeAssets.viteIcon} alt="Vite" className="tech-icon" />
                  </a>
                  <a href="https://www.typescriptlang.org/docs/" target="_blank" rel="noopener noreferrer">
                    <img src={themeAssets.typescriptIcon} alt="TypeScript" className="tech-icon" />
                  </a>
                </div>
              </div>
              <div className="contact-section">
                <div className="contact-info">
                  <img src={themeAssets.phoneIcon} alt="Телефон" className="contact-icon" />
                  <span className="contact-text">+38 (066) 993-20-87</span>
                </div>
                <div className="contact-info">
                  <img src={themeAssets.emailIcon} alt="Електронна пошта" className="contact-icon" />
                  <a href="mailto:chosensoul404@gmail.com" className="contact-text">chosensoul404@gmail.com</a>
                </div>
                <div className="contact-info">
                  <img src={themeAssets.websiteIcon} alt="Вебсайт" className="contact-icon" />
                  <a href="https://chosensoul.kesug.com" target="_blank" rel="noopener noreferrer" className="contact-text">chosensoul.kesug.com</a>
                </div>
              </div>
            </div>
            <p className="copyright">@Copyright 2025 ChosenSoul усі права захищені ліцензією GPL 3</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainMenu;