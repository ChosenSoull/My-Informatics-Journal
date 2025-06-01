/*
 / My-Informatics-Journal - A project from Informatics class on 05/09/2025
 / Copyright (C) 2025 ChosenSoul
 /
 / This program is free software: you can redistribute it and/or modify
 / it under the terms of the GNU General Public License as published by
 / the Free Software Foundation, either version 3 of the License, or
 / (at your option) any later version.

 / This program is distributed in the hope that it will be useful,
 / but WITHOUT ANY WARRANTY; without even the implied warranty of
 / MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 / GNU General Public License for more details.

 / You should have received a copy of the GNU General Public License
 / along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
import React, { useContext, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../theme';
import { useNavigate } from 'react-router-dom';
import './MainMenu.css';
import Cropper, { type ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import sanitizeHtml from 'sanitize-html';
import { Registration_Path } from '../transition';
import { getCurrentLanguage } from '../../../i18n';

interface Comment {
  id: number;
  avatar: string;
  name: string;
  message: string;
}

const MainMenu: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isChapterMenuOpen, setIsChapterMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);
  const [username, setUsername] = useState(t('account_default_username'));
  const accountNameRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState('/assets/default_user_icon.png');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  const navigate = useNavigate();
  const handleRegistration = () => navigate(`/${getCurrentLanguage()}${Registration_Path}`);

  const chapters = [
    { id: 1, title: t('chapter_1_title') },
    { id: 2, title: t('chapter_2_title') },
    { id: 3, title: t('chapter_3_title') },
    { id: 4, title: t('chapter_4_title') },
    { id: 5, title: t('chapter_5_title') },
    { id: 6, title: t('chapter_6_title') },
    { id: 7, title: t('chapter_7_title') },
  ];

  const getThemeAssets = (currentTheme: string) => {
    const themeSuffix = currentTheme === 'light' ? '-dark' : '-light';
    return {
      logo: `/assets/icon${themeSuffix}.png`,
      themeIcon: currentTheme === 'light' ? '/assets/night-dark.png' : '/assets/day-light.png',
      themeAlt: currentTheme === 'light' ? t('theme_toggle_light') : t('theme_toggle_dark'),
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
      TranslateIcon: `/assets/translate${themeSuffix}.png`,
    };
  };

  const themeAssets = getThemeAssets(theme);

  // Language options
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'uk', name: 'Українська' },
  ];

  const scrollToChapter = (chapterId: number) => {
    const element = document.getElementById(`chapter-${chapterId}`);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const headerHeight = 70;
      window.scrollTo({ top: elementPosition - headerHeight, behavior: 'smooth' });
    }
    setIsChapterMenuOpen(false);
  };

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('selectedLanguage', langCode);
    setIsLanguageMenuOpen(false);
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(/^\/[a-z]{2}/, `/${langCode}`);
    navigate(newPath);
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
      console.error(t('error_network'), error);
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
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
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
            console.error(t('error_network'), error);
          }
        }
      }
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const tiltSettings: { [key: string]: { baseMaxAngleX: number; baseMaxAngleY: number } } = {
      chapter1: { baseMaxAngleX: 20, baseMaxAngleY: 20 },
      chapter2: { baseMaxAngleX: 15, baseMaxAngleY: 15 },
      chapter4: { baseMaxAngleX: 25, baseMaxAngleY: 25 },
      chapter5_1: { baseMaxAngleX: 20, baseMaxAngleY: 20 },
      chapter5_2: { baseMaxAngleX: 30, baseMaxAngleY: 30 },
      chapter6: { baseMaxAngleX: 20, baseMaxAngleY: 20 },
    };

    const handleMouseMove = (e: MouseEvent, element: HTMLDivElement) => {
      const updateTransform = () => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        const elementId = element.id;
        const { baseMaxAngleX, baseMaxAngleY } =
          tiltSettings[elementId] || { baseMaxAngleX: 20, baseMaxAngleY: 20 };

        const baseSize = 200;
        const sizeFactorX = Math.min(rect.width / baseSize, 2);
        const sizeFactorY = Math.min(rect.height / baseSize, 2);

        const maxAngleX = baseMaxAngleX * sizeFactorX;
        const maxAngleY = baseMaxAngleY * sizeFactorY;

        const rotateY = (mouseX / (rect.width / 2)) * maxAngleX;
        const rotateX = -(mouseY / (rect.height / 2)) * maxAngleY;

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

      divElement.addEventListener('mousemove', moveHandler);
      divElement.addEventListener('mouseleave', () => handleMouseLeave(divElement));

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
      console.error(t('error_avatar_crop'));
      alert(t('error_avatar_crop'));
      return;
    }

    try {
      const mimeType = avatarFile?.type || 'image/png';
      const extensionMap: { [key: string]: string } = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/gif': 'gif',
        'image/webp': 'webp',
      };
      const extension = extensionMap[mimeType] || 'png';

      cropperInstance.getCroppedCanvas({
        width: 200,
        height: 200,
      }).toBlob(
        async (blob) => {
          if (blob) {
            const formData = new FormData();
            formData.append('avatar', blob, `avatar.${extension}`);
            try {
              const response = await fetch('/avatar.php', {
                method: 'POST',
                body: formData,
              });
              if (response.ok) {
                console.log(t('success_avatar_upload'));
                setIsChangeAvatarModalOpen(false);
                setAvatarFile(null);
                setIsCropperReady(false);
                setAvatarSrc('/avatar.php');
                window.location.reload();
              } else {
                console.error(t('error_avatar_upload', { statusText: response.statusText }));
                alert(t('error_avatar_upload', { statusText: response.statusText }));
              }
            } catch (error) {
              console.error(t('error_network'), error);
              alert(t('error_network'));
            }
          } else {
            console.error(t('error_avatar_blob'));
            alert(t('error_avatar_blob'));
          }
        },
        mimeType,
        0.9
      );
    } catch (canvasError) {
      console.error(t('error_canvas_crop'), canvasError);
      alert(t('error_canvas_crop'));
    }
  };

  const handleCloseAvatarModal = () => {
    setIsChangeAvatarModalOpen(false);
    setAvatarFile(null);
    setIsCropperReady(false);
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) {
      alert(t('error_empty_username'));
      return;
    }
    try {
      const response = await fetch('/chname.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername }),
      });
      if (response.ok) {
        alert(t('success_username_changed'));
        setIsChangeUsernameModalOpen(false);
        setNewUsername('');
        setUsername(newUsername);
      } else {
        alert(t('error_change_username'));
      }
    } catch (error) {
      console.error(t('error_network'), error);
      alert(t('error_network'));
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert(t('error_empty_password_fields'));
      return;
    }
    if (newPassword !== confirmPassword) {
      alert(t('error_password_mismatch'));
      return;
    }
    try {
      const response = await fetch('/chpassword.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (response.ok) {
        alert(t('success_password_changed'));
        setIsChangePasswordModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(t('error_change_password'));
      }
    } catch (error) {
      console.error(t('error_network'), error);
      alert(t('error_network'));
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
      setUsername(t('account_default_username'));
      setAvatarSrc('assets/default_user_icon.png');
      window.location.reload();
    } catch (error) {
      console.error(t('error_logout'), error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      alert(t('error_empty_comment'));
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
        alert(t('success_comment_submitted'));
        setCommentText('');
      } else {
        alert(t('error_comment_submit'));
      }
    } catch (error) {
      console.error(t('error_network'), error);
      alert(t('error_network'));
    }
  };

  return (
    <div className="page-container">
      <header className="header">
        <div className="header-left">
          <img src={themeAssets.logo} alt={t('site_name')} className="icon-image" />
          <span className="site-name">{t('site_name')}</span>
        </div>
        <div className="header-right">
        <div
            className={`language-toggle ${isLanguageMenuOpen ? 'active' : ''}`}
            onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
            ref={languageMenuRef}
          >
            <img
              src={themeAssets.TranslateIcon}
              alt={t('language_toggle')}
              className="language-icon"
            />
            <div className={`language-menu ${isLanguageMenuOpen ? 'active' : ''}`}>
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className={`language-item ${i18n.language === lang.code ? 'selected' : ''}`}
                  onClick={() => changeLanguage(lang.code)}
                >
                  {lang.name}
                </div>
              ))}
            </div>
          </div>
          <div className="theme-toggle" onClick={toggleTheme}>
            <img src={themeAssets.themeIcon} alt={themeAssets.themeAlt} className="theme-icon" />
          </div>
          <div
            className={`account-section ${isAccountOpen ? 'active' : ''}`}
            onClick={() => setIsAccountOpen(!isAccountOpen)}
          >
            <div className={`account-frame ${isAccountOpen ? 'active' : ''}`}>
              <span ref={accountNameRef} className="account-name">
                {username}
              </span>
              <img src={avatarSrc} alt={t('account_alt')} className="account-icon" />
            </div>
            <div className={`account-tooltip ${isAccountOpen ? 'active' : ''}`}>
              <div className="tooltip-item" onClick={handleRegistration}>
                {t('registration')}
              </div>
              <div
                className={`tooltip-item ${!isUserLoggedIn ? 'hidden' : ''}`}
                onClick={() => {
                  setIsAccountOpen(false);
                  setIsChangeAvatarModalOpen(true);
                }}
              >
                {t('change_avatar')}
              </div>
              <div
                className={`tooltip-item ${!isUserLoggedIn ? 'hidden' : ''}`}
                onClick={() => {
                  setIsAccountOpen(false);
                  setIsChangeUsernameModalOpen(true);
                }}
              >
                {t('change_username')}
              </div>
              <div
                className={`tooltip-item ${!isUserLoggedIn ? 'hidden' : ''}`}
                onClick={() => {
                  setIsAccountOpen(false);
                  setIsChangePasswordModalOpen(true);
                }}
              >
                {t('change_password')}
              </div>
              <div
                className={`tooltip-item ${!isUserLoggedIn ? 'hidden' : ''}`}
                onClick={() => {
                  setIsAccountOpen(false);
                  handleLogout();
                }}
              >
                {t('logout')}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="content-wrapper">
          <h1 className="main-title">
            <span className="main-text">{t('main_title_part1')}</span>
            <br />
            <span className="gradient-text">{t('main_title_part2')}</span>
          </h1>
          <div className="container-start-menu">
            <p className="shadow"></p>
            <div className="box">
              <div className="block">
                <img
                  src={themeAssets.introductionProgramming}
                  alt={t('block_introduction')}
                  className="block-image"
                />
                <span className="block-text">{t('block_introduction')}</span>
              </div>
              <div className="block">
                <img
                  src={themeAssets.firstProjectIdea}
                  alt={t('block_first_project_idea')}
                  className="block-image"
                />
                <span className="block-text">{t('block_first_project_idea')}</span>
              </div>
            </div>
            <div className="box">
              <div className="block">
                <img
                  src={themeAssets.firstProject}
                  alt={t('block_first_project')}
                  className="block-image"
                />
                <span className="block-text">{t('block_first_project')}</span>
              </div>
              <div className="block">
                <img
                  src={themeAssets.plansForTheFuture}
                  alt={t('block_future_plans')}
                  className="block-image"
                />
                <span className="block-text">{t('block_future_plans')}</span>
              </div>
            </div>
          </div>
          <h2 className="roadmap-h2">{t('roadmap_title')}</h2>
          <div className="roadmap">
            <div className="roadmap-line"></div>
            <div className="roadmap-chapters">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="chapter-circle"
                  onClick={() => scrollToChapter(chapter.id)}
                >
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
                      <img src="/assets/chapter.id1.jpg" alt={t('chapter_1_title')} />
                    </div>
                    <p>{t('chapter_1_text_1')}</p>
                    <p>{t('chapter_1_text_2')}</p>
                  </>
                )}
                {chapter.id === 2 && (
                  <>
                    <div className="chapterImage" id="chapter2">
                      <img src="/assets/chapter.id2.jpg" alt={t('chapter_2_title')} />
                    </div>
                    <p>{t('chapter_2_text_1')}</p>
                    <p>{t('chapter_2_text_2')}</p>
                  </>
                )}
                {chapter.id === 3 && (
                  <>
                    <p>{t('chapter_3_text_1')}</p>
                    <p>{t('chapter_3_text_2')}</p>
                  </>
                )}
                {chapter.id === 4 && (
                  <>
                    <div className="chapterImage" id="chapter4">
                      <img src="/assets/chapter.id4.jpg" alt={t('chapter_4_title')} />
                    </div>
                    <p>{t('chapter_4_text_1')}</p>
                    <p>{t('chapter_4_text_2')}</p>
                  </>
                )}
                {chapter.id === 5 && (
                  <>
                    <div className="chapterImage" id="chapter5_1">
                      <img src="/assets/chapter.id5_1.jpg" alt={t('chapter_5_title')} />
                    </div>
                    <p>{t('chapter_5_text_1')}</p>
                    <p>{t('chapter_5_text_2')}</p>
                    <div className="chapterImage" id="chapter5_2">
                      <img src="/assets/chapter.id5_2.jpg" alt={t('chapter_5_title')} />
                    </div>
                    <p>{t('chapter_5_text_3')}</p>
                  </>
                )}
                {chapter.id === 6 && (
                  <>
                    <div className="chapterImage" id="chapter6">
                      <img src="/assets/chapter.id6.jpg" alt={t('chapter_6_title')} />
                    </div>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(t('chapter_6_text_1')),
                      }}
                    ></p>
                    <p>{t('chapter_6_text_2')}</p>
                  </>
                )}
                {chapter.id === 7 && (
                  <>
                    <p>{t('chapter_7_text_1')}</p>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(t('chapter_7_text_2')),
                      }}
                    ></p>
                  </>
                )}
              </section>
            ))}
            <div className="comments-container">
              {isUserLoggedIn ? (
                <div className="comment-input-area">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t('comment_placeholder')}
                    className="comment-textarea"
                  ></textarea>
                  <button className="comment-button" onClick={handleCommentSubmit}>
                    {t('comment_submit')}
                  </button>
                </div>
              ) : null}
              <div className="comments-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <img src={comment.avatar} alt={comment.name} className="comment-avatar" />
                    <div className="comment-body">
                      <span className="comment-name">{comment.name}</span>
                      <p
                        className="comment-message"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment.message) }}
                      ></p>
                    </div>
                  </div>
                ))}
              </div>
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
              <a
                href="https://discordapp.com/users/912451953106255894"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={themeAssets.discordIcon} alt="Discord" className="social-icon" />
              </a>
              <a href="https://t.me/ChosenS0ul" target="_blank" rel="noopener noreferrer">
                <img src={themeAssets.telegramIcon} alt="Telegram" className="social-icon" />
              </a>
              <a href="https://github.com/ChosenSoull" target="_blank" rel="noopener noreferrer">
                <img src={themeAssets.githubIcon} alt="GitHub" className="social-icon" />
              </a>
            </div>
            <p className="social-label">{t('social_label')}</p>
          </div>
          <div className="tech-contact-section">
            <div className="tech-contact-wrapper">
              <div className="tech-section">
                <p className="tech-label">{t('tech_label')}</p>
                <div className="tech-icons">
                  <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">
                    <img src={themeAssets.reactIcon} alt="React" className="tech-icon" />
                  </a>
                  <a href="https://vite.dev/" target="_blank" rel="noopener noreferrer">
                    <img src={themeAssets.viteIcon} alt="Vite" className="tech-icon" />
                  </a>
                  <a
                    href="https://www.typescriptlang.org/docs/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={themeAssets.typescriptIcon} alt="TypeScript" className="tech-icon" />
                  </a>
                </div>
              </div>
              <div className="contact-section">
                <div className="contact-info">
                  <img src={themeAssets.phoneIcon} alt={t('phone_label')} className="contact-icon" />
                  <span className="contact-text">+38 (066) 993-20-87</span>
                </div>
                <div className="contact-info">
                  <img src={themeAssets.emailIcon} alt={t('email_label')} className="contact-icon" />
                  <a href="mailto:chosensouldev@gmail.com" className="contact-text">
                    chosensouldev@gmail.com
                  </a>
                </div>
                <div className="contact-info">
                  <img
                    src={themeAssets.websiteIcon}
                    alt={t('website_label')}
                    className="contact-icon"
                  />
                  <a
                    href="https://chosensoul.kesug.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-text"
                  >
                    chosensoul.kesug.com
                  </a>
                </div>
              </div>
            </div>
            <p className="copyright">{t('copyright')}</p>
          </div>
        </div>
      </footer>

      {isChangeAvatarModalOpen && (
        <div className="modal-overlay" onClick={handleCloseAvatarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{t('avatar_modal_title')}</h3>
            <label htmlFor="avatar-input" className="custom-file-button">
              {avatarFile ? t('avatar_select_another_image') : t('avatar_select_image')}
            </label>
            <input
              id="avatar-input"
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={handleAvatarChange}
              className="file-input"
            />
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
              <button
                className="modal-button modal-button-save"
                onClick={handleAvatarCrop}
                disabled={!isCropperReady || !avatarFile}
              >
                {t('avatar_upload')}
              </button>
              <button className="modal-button modal-button-cancel" onClick={handleCloseAvatarModal}>
                {t('avatar_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isChangeUsernameModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsChangeUsernameModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{t('username_modal_title')}</h3>
            <div className="modal-input-container">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={t('username_placeholder')}
                className="modal-input"
              />
            </div>
            <div className="modal-actions">
              <button
                className="modal-button modal-button-save"
                onClick={handleChangeUsername}
              >
                {t('username_save')}
              </button>
              <button
                className="modal-button modal-button-cancel"
                onClick={() => setIsChangeUsernameModalOpen(false)}
              >
                {t('username_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isChangePasswordModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsChangePasswordModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{t('password_modal_title')}</h3>
            <div className="modal-password-fields">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t('password_current_placeholder')}
                className="modal-input"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('password_new_placeholder')}
                className="modal-input"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('password_confirm_placeholder')}
                className="modal-input"
              />
            </div>
            <div className="modal-actions">
              <button
                className="modal-button modal-button-save"
                onClick={handleChangePassword}
              >
                {t('password_save')}
              </button>
              <button
                className="modal-button modal-button-cancel"
                onClick={() => setIsChangePasswordModalOpen(false)}
              >
                {t('password_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;