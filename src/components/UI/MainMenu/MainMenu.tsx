import React, { useContext, useState, useEffect, useRef } from 'react';
import { ThemeContext } from '../theme';
import { useNavigate } from 'react-router-dom';
import './MainMenu.css';
import Cropper, { type ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import sanitizeHtml from 'sanitize-html';
import { Registration_Path } from '../transition';


interface Comment {
  id: number;
  avatar: string;
  name: string;
  message: string;
}

const MainMenu: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isChapterMenuOpen, setIsChapterMenuOpen] = useState(false);
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);
  const [username, setUsername] = useState('Користувач');
  const accountNameRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState('assets/default_user_icon.png');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  const navigate = useNavigate();
  const handleRegistration = () => navigate(Registration_Path);

  const chapters = [
    { id: 1, title: "Вступ: Мій шлях у програмування" },
    { id: 2, title: "Розділ 1: Новий ноутбук і перші кроки" },
    { id: 3, title: "Розділ 2: Перші експерименти та відкриття" },
    { id: 4, title: "Розділ 3: Повернення до програмування" },
    { id: 5, title: "Розділ 4: Знайомство з Linux" },
    { id: 6, title: "Розділ 5: Мій перший серйозний проєкт" },
    { id: 7, title: "Висновок: Мої підсумки та плани" },
  ];

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

  const loadUserInfo = async () => {
    try {
      const response = await fetch('/account-info.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok && data.name && data.avatarsrc) {
        setUsername(data.name);
        setAvatarSrc(data.avatarsrc);
        setIsUserLoggedIn(true);
      }
    } catch (error) {
      console.error('Помилка при завантаженні інформації про користувача:', error);
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

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
      const accountSection = document.querySelector('.account-section');
      if (accountSection && !accountSection.contains(event.target as Node)) {
        setIsAccountOpen(false);
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
  }, [username, isAccountOpen]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const commentsSection = document.querySelector('.comments-container');
      if (commentsSection) {
        const rect = commentsSection.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        if (isVisible) {
          try {
            const response = await fetch('/getcomments.php');
            if (response.ok) {
              const data = await response.json();
              setComments(data);
            }
          } catch (error) {
            console.error('Помилка при оновленні коментарів:', error);
          }
        }
      }
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
  
    // Настройки для каждого id (базовый угол наклона)
    const tiltSettings: { [key: string]: { baseMaxAngleX: number; baseMaxAngleY: number } } = {
      chapter1: { baseMaxAngleX: 20, baseMaxAngleY: 20 },
      chapter2: { baseMaxAngleX: 15, baseMaxAngleY: 15 },
      chapter4: { baseMaxAngleX: 25, baseMaxAngleY: 25 },
      chapter5_1: { baseMaxAngleX: 20, baseMaxAngleY: 20 },
      chapter5_2: { baseMaxAngleX: 30, baseMaxAngleY: 30 }, // Индивидуальные параметры для chapter5_2
      chapter6: { baseMaxAngleX: 20, baseMaxAngleY: 20 },
    };
  
    const handleMouseMove = (e: MouseEvent, element: HTMLDivElement) => {
      const updateTransform = () => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
  
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
  
        // Получаем id элемента
        const elementId = element.id;
  
        // Получаем базовые углы для данного id или используем значения по умолчанию
        const { baseMaxAngleX, baseMaxAngleY } =
          tiltSettings[elementId] || { baseMaxAngleX: 20, baseMaxAngleY: 20 };
  
        // Динамически масштабируем угол наклона в зависимости от размера изображения
        // Берем ширину и высоту изображения и масштабируем относительно базового размера (например, 200px)
        const baseSize = 200; // Базовый размер для расчета коэффициента
        const sizeFactorX = Math.min(rect.width / baseSize, 2); // Ограничиваем максимальный коэффициент до 2
        const sizeFactorY = Math.min(rect.height / baseSize, 2);
  
        // Финальные углы с учетом размера
        const maxAngleX = baseMaxAngleX * sizeFactorX;
        const maxAngleY = baseMaxAngleY * sizeFactorY;
  
        // Нормализация углов на основе размеров элемента
        const rotateY = (mouseX / (rect.width / 2)) * maxAngleX;
        const rotateX = -(mouseY / (rect.height / 2)) * maxAngleY;
  
        // Применяем трансформацию только если элемент виден и имеет ненулевые размеры
        if (rect.width > 0 && rect.height > 0) {
          element.style.transform = `perspective(500px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.05)`;
        }
      };
  
      animationFrameId = requestAnimationFrame(updateTransform);
    };
  
    const handleMouseLeave = (element: HTMLDivElement) => {
      cancelAnimationFrame(animationFrameId);
      element.style.transform = 'perspective(500px) rotateY(0deg) rotateX(0deg) scale(1)';
    };
  
    const chapterImages = document.querySelectorAll('.chapterImage');
    chapterImages.forEach((element) => {
      const divElement = element as HTMLDivElement;
      const moveHandler = (e: MouseEvent) => handleMouseMove(e, divElement);
  
      // Убедимся, что событие срабатывает на всей области .chapterImage
      divElement.addEventListener('mousemove', moveHandler);
      divElement.addEventListener('mouseleave', () => handleMouseLeave(divElement));
  
      // Очистка событий при размонтировании
      return () => {
        divElement.removeEventListener('mousemove', moveHandler);
        divElement.removeEventListener('mouseleave', () => handleMouseLeave(divElement));
      };
    });
  }, []);

  const [isChangeAvatarModalOpen, setIsChangeAvatarModalOpen] = useState(false);
  const [isChangeUsernameModalOpen, setIsChangeUsernameModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const cropperRef = useRef<ReactCropperElement>(null);
  const [isCropperReady, setIsCropperReady] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setIsCropperReady(false);
      if (e.target) e.target.value = '';
    } else {
      setAvatarFile(null);
      setIsCropperReady(false);
    }
  };

  const handleAvatarCrop = async () => {
    const cropperInstance = cropperRef.current?.cropper;
    if (!cropperInstance || !isCropperReady) {
      console.error('Cropper instance is not available or not ready.');
      alert('Зачекайте, поки зображення завантажиться і буде готове до обрізки.');
      return;
    }

    try {
      cropperInstance.getCroppedCanvas({
        width: 200,
        height: 200,
      }).toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData();
          formData.append('avatar', blob, 'avatar.png');
          try {
            const response = await fetch('/avatar.php', {
              method: 'POST',
              body: formData,
            });
            if (response.ok) {
              console.log('Аватар успішно завантажено!');
              setIsChangeAvatarModalOpen(false);
              setAvatarFile(null);
              setIsCropperReady(false);
              setAvatarSrc('/avatar.php');
            } else {
              console.error('Помилка завантаження аватара:', response.status, response.statusText);
              alert(`Помилка завантаження аватара: ${response.statusText}`);
            }
          } catch (error) {
            console.error('Помилка мережі під час завантаження:', error);
            alert('Сталася мережева помилка під час завантаження аватара.');
          }
        } else {
          console.error('Не вдалося отримати Blob з обрізаного зображення.');
          alert('Не вдалося обробити зображення для завантаження.');
        }
      }, 'image/png', 0.9);
    } catch (canvasError) {
      console.error('Помилка при отриманні canvas з Cropper:', canvasError);
      alert('Виникла помилка при обробці зображення.');
    }
  };

  const handleCloseAvatarModal = () => {
    setIsChangeAvatarModalOpen(false);
    setAvatarFile(null);
    setIsCropperReady(false);
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) {
      alert('Будь ласка, введіть нове ім’я.');
      return;
    }
    try {
      const response = await fetch('/chname.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername }),
      });
      if (response.ok) {
        alert('Ім’я успішно змінено!');
        setIsChangeUsernameModalOpen(false);
        setNewUsername('');
        setUsername(newUsername);
      } else {
        alert('Помилка при зміні імені.');
      }
    } catch (error) {
      console.error('Помилка мережі:', error);
      alert('Сталася мережева помилка.');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Будь ласка, заповніть усі поля.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Нові паролі не збігаються.');
      return;
    }
    try {
      const response = await fetch('/chpassword.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (response.ok) {
        alert('Пароль успішно змінено!');
        setIsChangePasswordModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert('Помилка при зміні пароля. Перевірте поточний пароль.');
      }
    } catch (error) {
      console.error('Помилка мережі:', error);
      alert('Сталася мережева помилка.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/logout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      localStorage.clear();
      setIsUserLoggedIn(false);
      setUsername('Користувач');
      setAvatarSrc('assets/default_user_icon.png');
      window.location.reload();
    } catch (error) {
      console.error('Помилка при виході з системи:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      alert('Будь ласка, введіть коментар.');
      return;
    }
    const sanitizedComment = sanitizeHtml(commentText);
    try {
      const response = await fetch('/comment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: sanitizedComment }),
      });
      if (response.ok) {
        alert('Коментар успішно відправлено!');
        setCommentText('');
      } else {
        alert('Помилка при відправленні коментаря.');
      }
    } catch (error) {
      console.error('Помилка мережі:', error);
      alert('Сталася мережева помилка.');
    }
  };

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
              <img src={avatarSrc} alt="Обліковий запис" className="account-icon" />
            </div>
            <div className={`account-tooltip ${isAccountOpen ? 'active' : ''}`}>
              <div className="tooltip-item" onClick={handleRegistration}>Реєстрація</div>
              <div className={`tooltip-item ${!isUserLoggedIn ? 'hidden' : ''}`} onClick={() => { setIsAccountOpen(false); setIsChangeAvatarModalOpen(true); }}>Змінити аватар</div>
              <div className={`tooltip-item ${!isUserLoggedIn ? 'hidden' : ''}`} onClick={() => { setIsAccountOpen(false); setIsChangeUsernameModalOpen(true); }}>Змінити ім'я</div>
              <div className={`tooltip-item ${!isUserLoggedIn ? 'hidden' : ''}`} onClick={() => { setIsAccountOpen(false); setIsChangePasswordModalOpen(true); }}>Змінити пароль</div>
              <div className={`tooltip-item ${!isUserLoggedIn ? 'hidden' : ''}`} onClick={() => { setIsAccountOpen(false); handleLogout(); }}>Вихід</div>
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

          <div className="chapters-content">
            {chapters.map((chapter) => (
              <section key={chapter.id} id={`chapter-${chapter.id}`} className="chapter-section">
                <h2 className="chapter-title">{chapter.title}</h2>
                {chapter.id === 1 && (
                  <>
                    <div className="chapterImage" id="chapter1">
                      <img src="assets/chapter.id1.jpg" alt="Зображення до глави 1" />
                    </div>
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
                    <div className="chapterImage" id="chapter2">
                      <img src="assets/chapter.id2.jpg" alt="Зображення до глави 2" />
                    </div>
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
                    <div className="chapterImage" id="chapter4">
                      <img src="assets/chapter.id4.jpg" alt="Зображення до глави 4" />
                    </div>
                    <p>
                      Повернувшись у 2023 рік, я вирішив спробувати себе в ролі програміста. Мені подобалося створювати щось нове, і я вирішив, що програмування — це моє. У 7 класі я почав вивчати основи: спочатку розібрався, де й що використовується, а потім спробував себе в різних сферах. Але часу катастрофично не вистачало: я вставав о 9 ранку, уроки тривали до 2 годин дня, а потім ще було багато домашнього завдання.
                    </p>
                    <p>
                      У 2024 році я вирішив зосередитися тільки на інформатиці. Уроки проходили віддалено через Google Meet, і я, відкладавши телефон, читав книги з програмування. Тоді я вирішив вивчати веброзробку, доки не знайду те, що мені по-справжньому цікаво. У процесі я дізнався про рух Open Source, Git, GitHub, IDE та інші важливі терміни.
                    </p>
                  </>
                )}
                {chapter.id === 5 && (
                  <>
                    <div className="chapterImage" id="chapter5_1">
                      <img src="assets/chapter.id5_1.jpg" alt="Зображення до глави 5_1" />
                    </div>
                    <p>
                      Одного разу я вирішив спробувати одне з головних винаходів Open Source — Linux. Ми з моїм другом Микитою Агашковим сиділи в Discord, і я запропонував експеримент: на 2 тижні перейти на Linux. Микита погодився й запропонував парі: якщо я хоч раз перевстановлю Linux на Windows, він виграє 100 грн. Я записав на флешку образ дистрибутива Ubuntu версії 24.04, але установник підтримував тільки UEFI, а мій старий ноутбук його не підтримував. Тоді я вибрав Ubuntu 22.04 і успішно його встановив. Після цього я зіткнувся з незвичним середовищем GNOME: панель зверху, величезне меню програм замість компактного «Пуску» — усе це нагадувало macOS. Я вирішив дослідити альтернативи, такі як KDE, XFCE, LXDE та інші, і з усіх варіантів мені особливо сподобався KDE. Однак Ubuntu не була оптимізована для зміни робочих середовищ, і встановлення KDE не вдалося. Усе ж я вирішив дати шанс GNOME і звикнути, але через 4 дні зрозумів, що мені незручно.
                    </p>
                    <p>
                      Протягом цих 4 днів мені знадобилися деякі програми Windows, і я встановив Wine — слой сумісності для запуску Windows-програм на Linux. Версія 4.0, стабільна для Ubuntu 22.04, виявилася застарілою (на сайті Wine уже була версія 9.2). Деякі програми не запускалися, і я вирішив спробувати дистрибутив із системою пакетів rolling-release, де всі програми оновлюються до останніх версій.
                    </p>
                    <div className="chapterImage" id="chapter5_2">
                      <img src="assets/chapter.id5_2.jpg" alt="Зображення до глави 5_2" />
                    </div>
                    <p>
                      Мій вибір припав на Arch Linux. Багато хто вважає, що його встановлення складне через відсутність графічного інтерфейсу, але для мене воно виявилося простішим, ніж очікувалося. Після тижня налаштування я встановив робоче середовище KDE і необхідні програми: Firefox, Steam, Spotify, Telegram, а також Wine 9.3. Мені знадобився Photoshop CS6 для створення іконок для проєкту, але Adobe не підтримує Linux. За допомогою Wine я запустив Photoshop, і все запрацювало чудово.
                    </p>
                  </>
                )}
                {chapter.id === 6 && (
                  <>
                    <div className="chapterImage" id="chapter6">
                      <img src="assets/chapter.id6.jpg" alt="Зображення до глави 6" />
                    </div>
                    <p>
                      У цей же час я вперше встановив IDE — Visual Studio Code, яким користуюся досі, а також GitHub Desktop для роботи з Git. Тоді я почав свій перший серйозний проєкт, який досі є на GitHub <a href="https://github.com/ChosenSoull/MasterSwordOnline">посилання</a>. Я створював його, щоб перевірити, чому навчився за рік — із 2023 по 2024.
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
                      Дякую, що прочитали моє домашнє завдання з інформатики та мою історію про те, як я прийшов до своєї улюбленої справи! Будь ласка, пишіть коментарі, діліться своєю думкою та вказуйте на помилки в <a href="https://github.com/ChosenSoull/My-Informatics-Journal">репозиторії проєкту</a>. Успіхів усім! 😊
                    </p>
                  </>
                )}
              </section>
            ))}
            <div className="comments-container">
              <div className="comments-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <img src={comment.avatar} alt={comment.name} className="comment-avatar" />
                    <div className="comment-body">
                      <span className="comment-name">{comment.name}</span>
                      <p className="comment-message" dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment.message) }}></p>
                    </div>
                  </div>
                ))}
              </div>
              {isUserLoggedIn ? (
                <div className="comment-input-area">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Залиште свій коментар..."
                    className="comment-textarea"
                  ></textarea>
                  <button className="comment-button" onClick={handleCommentSubmit}>
                    Надіслати
                  </button>
                </div>
              ) : null}
            </div>
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
                  <a href="mailto:chosensouldev@gmail.com" className="contact-text">chosensouldev@gmail.com</a>
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

      {isChangeAvatarModalOpen && (
        <div className="modal-overlay" onClick={handleCloseAvatarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Змінити аватар</h3>
            <label htmlFor="avatar-input" className="custom-file-button">
              {avatarFile ? 'Вибрати інше зображення' : 'Вибрати зображення'}
            </label>
            <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarChange} className="file-input" />
            {avatarFile && (
              <div className="cropper-container">
                <Cropper
                  src={URL.createObjectURL(avatarFile)}
                  className="cropper"
                  aspectRatio={1}
                  guides={true}
                  ready={() => setIsCropperReady(true)}
                  ref={cropperRef}
                  viewMode={1}
                  scalable={false}
                  zoomable={false}
                  zoomOnWheel={true}
                />
              </div>
            )}
            <div className="modal-actions">
              <button className="modal-button modal-button-save" onClick={handleAvatarCrop} disabled={!isCropperReady || !avatarFile}>
                Завантажити
              </button>
              <button className="modal-button modal-button-cancel" onClick={handleCloseAvatarModal}>
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}

      {isChangeUsernameModalOpen && (
        <div className="modal-overlay" onClick={() => setIsChangeUsernameModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Змінити ім’я</h3>
            <div className="modal-input-container">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Нове ім’я"
                className="modal-input"
              />
            </div>
            <div className="modal-actions">
              <button className="modal-button modal-button-save" onClick={handleChangeUsername}>
                Змінити ім’я
              </button>
              <button className="modal-button modal-button-cancel" onClick={() => setIsChangeUsernameModalOpen(false)}>
                Відклонити
              </button>
            </div>
          </div>
        </div>
      )}

      {isChangePasswordModalOpen && (
        <div className="modal-overlay" onClick={() => setIsChangePasswordModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Змінити пароль</h3>
            <div className="modal-password-fields">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Поточний пароль"
                className="modal-input"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Новий пароль"
                className="modal-input"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторити пароль"
                className="modal-input"
              />
            </div>
            <div className="modal-actions">
              <button className="modal-button modal-button-save" onClick={handleChangePassword}>
                Змінити пароль
              </button>
              <button className="modal-button modal-button-cancel" onClick={() => setIsChangePasswordModalOpen(false)}>
                Відклонити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;